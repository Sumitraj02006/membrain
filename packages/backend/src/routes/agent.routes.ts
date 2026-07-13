import { Router, Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { AgentService } from "../services/AgentService.js";
import { EmbeddingService } from "../services/EmbeddingService.js";
import { emitUserEvent } from "../socket/gateway.js";
import { scoringQueue } from "../workers/scoring.worker.js";

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message content cannot be blank"),
    sessionId: z.string().optional(),
  }),
});

const router = Router();

// Record token usage helper
async function recordTokenUsage(tokens: number, userId: string) {
  const budgetKey = `membrain:budget:${userId}`;
  const raw = await redis.get(budgetKey);
  let budget = raw ? JSON.parse(raw) : {
    totalTokens: 1000000,
    usedTokens: 0,
    remainingTokens: 1000000,
    usagePercentage: 0
  };
  budget.usedTokens += tokens;
  budget.remainingTokens = Math.max(0, budget.totalTokens - budget.usedTokens);
  budget.usagePercentage = Math.round((budget.usedTokens / budget.totalTokens) * 100);
  await redis.set(budgetKey, JSON.stringify(budget));
  
  emitUserEvent(userId, "budget_update", budget);

  // Context Surgery Trigger (85% threshold)
  if (budget.usagePercentage >= 85) {
    console.log(`[Context Surgery] Token budget usage at ${budget.usagePercentage}%. Enqueuing emergency decay job.`);
    await scoringQueue.add("budget-decay-job", { userId });
  }

  return budget;
}

// Chat API Route
router.post("/chat", authenticateToken, validateRequest(chatSchema), async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { message, sessionId } = req.body;
    const activeSessionId = sessionId || "default_session";

    // Create session title if not already enqueued
    let session = await redis.get(`membrain:session:${activeSessionId}`);
    if (!session) {
      await redis.set(`membrain:session:${activeSessionId}`, message.substring(0, 30));
    }

    // 1. Generate Qwen embedding for prompt
    const { embedding: textEmbedding, tokensUsed: embedTokens } = await EmbeddingService.generate(message);
    await recordTokenUsage(embedTokens, userId);

    // 2. Fetch context memories (concept matches using similarity)
    let matchedMemories: any[] = [];
    try {
      const vectorString = `[${textEmbedding.join(",")}]`;
      matchedMemories = await prisma.$queryRawUnsafe(`
        SELECT id, content, "tidScore", "accessCount", "lastAccessedAt", "createdAt"
        FROM "Memory"
        WHERE "userId" = '${userId}' AND status = 'ACTIVE'
        ORDER BY embedding <=> '${vectorString}'::vector ASC
        LIMIT 4
      `);
    } catch (err) {
      // Offline JS fallback (similarity match)
      const allMemories = await prisma.memory.findMany({
        where: { userId, status: "ACTIVE" }
      });
      const scored = allMemories.map(m => {
        // Read stored mock embedding in JSON (mocking vector column array conversion)
        const emb = (m as any).embeddingJson ? JSON.parse((m as any).embeddingJson) : [];
        const sim = EmbeddingService.cosineSimilarity(textEmbedding, emb);
        return { ...m, similarity: sim };
      });
      matchedMemories = scored
        .filter(m => m.similarity > 0.35)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 4);
    }

    // Update memory touches/access indices
    const now = new Date();
    for (const match of matchedMemories) {
      await prisma.memory.update({
        where: { id: match.id },
        data: {
          accessCount: { increment: 1 },
          lastAccessedAt: now
        }
      });
    }

    // 3. Obituary-based Context Injection (Phase 5)
    // Concept match matching deleted memory obituaries
    const obituaries = await prisma.memoryObituary.findMany({
      where: { memory: { userId } },
      include: { memory: true }
    });

    const matchedObituaries = obituaries.map(ob => {
      const emb = (ob.memory as any).embeddingJson ? JSON.parse((ob.memory as any).embeddingJson) : [];
      const sim = EmbeddingService.cosineSimilarity(textEmbedding, emb);
      return { summary: ob.summary, similarity: sim };
    }).filter(o => o.similarity > 0.25).sort((a, b) => b.similarity - a.similarity).slice(0, 3);

    // Context windows compilation
    const retrievedContexts = matchedMemories.map(m => {
      const deltaDays = (now.getTime() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return {
        content: m.content,
        ageDays: deltaDays,
        tidScore: m.tidScore
      };
    });

    // Prepend matching obituary summaries into text context
    const obituaryContextPrefix = matchedObituaries.map(o => `[Outdated Context Summary]: ${o.summary}`).join("\n");
    const systemPromptModifier = obituaryContextPrefix ? `${obituaryContextPrefix}\n\n` : "";

    // 4. Generate Chat Response synchronously
    const chatResult = await AgentService.generateChatResponse(
      promptContent(message, systemPromptModifier),
      [], // Session history fetched on frontend or passed
      retrievedContexts
    );

    const { text: chatReply, tokensUsed: chatTokens } = chatResult;

    // Save Chat Messages history to Redis cache
    const chatMsgKey = `membrain:chat:${userId}:${activeSessionId}`;
    const rawHistory = await redis.get(chatMsgKey);
    const historyList = rawHistory ? JSON.parse(rawHistory) : [];
    
    const userMsg = { id: Math.random().toString(36).substring(2, 9), role: "user", content: message, createdAt: now.toISOString() };
    const assistantMsg = { id: Math.random().toString(36).substring(2, 9), role: "assistant", content: chatReply, createdAt: now.toISOString() };
    
    historyList.push(userMsg);
    historyList.push(assistantMsg);
    await redis.set(chatMsgKey, JSON.stringify(historyList));

    // Respond immediately to the frontend
    res.json({
      sessionId: activeSessionId,
      reply: chatReply,
      tokensUsed: chatTokens
    });

    // Run database memory persistence and metric analysis in the background
    setTimeout(async () => {
      try {
        const metricsResult = await AgentService.analyzeMemoryMetrics(message);
        const { goalRelevance, noiseScore, tokensUsed: metricsTokens } = metricsResult;
        
        await recordTokenUsage(chatTokens + metricsTokens, userId);

        const alpha = 0.25;
        const beta = 0.35;
        const gamma = 0.30;
        const delta = 0.10;
        const rawTid = (alpha * 1.0) + (beta * 1.0) + (gamma * goalRelevance) - (delta * noiseScore);
        const initialTid = Math.max(0, Math.min(1.0, rawTid));

        let newMem = await prisma.memory.create({
          data: {
            userId,
            content: message,
            contentTokens: Math.ceil(message.length / 4),
            tidScore: initialTid,
            recencyScore: 1.0,
            goalScore: goalRelevance,
            noiseScore: noiseScore,
            accessCount: 1,
            sessionId: activeSessionId,
            embeddingJson: JSON.stringify(textEmbedding)
          }
        });

        try {
          const vectorString = `[${textEmbedding.join(",")}]`;
          await prisma.$executeRawUnsafe(`
            UPDATE "Memory"
            SET embedding = '${vectorString}'::vector
            WHERE id = '${newMem.id}'
          `);
        } catch (e) {
          // Keep mock embedding Json
        }

        emitUserEvent(userId, "memory_updated");
      } catch (err) {
        console.error("[Background] Failed to persist memory engram:", err);
      }
    }, 0);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chat session failure" });
  }
});

function promptContent(message: string, prefix: string): string {
  return prefix ? `${prefix}User request: ${message}` : message;
}

// Get sessions
router.get("/sessions", authenticateToken, async (req: any, res: Response) => {
  const userId = req.user.id;
  // Fetch sessions from Redis
  const keys = await redis.keys(`membrain:chat:${userId}:*`);
  const sessions = [];
  for (const k of keys) {
    const sessionId = k.split(":").pop() || "";
    const title = await redis.get(`membrain:session:${sessionId}`) || "Memory Stream";
    sessions.push({ id: sessionId, title });
  }
  if (sessions.length === 0) {
    sessions.push({ id: "default_session", title: "Original Memory Stream" });
  }
  res.json(sessions);
});

// Get session history
router.get("/history/:sessionId", authenticateToken, async (req: any, res: Response) => {
  const userId = req.user.id;
  const { sessionId } = req.params;
  const raw = await redis.get(`membrain:chat:${userId}:${sessionId}`);
  const messages = raw ? JSON.parse(raw) : [];
  res.json(messages);
});

export default router;
