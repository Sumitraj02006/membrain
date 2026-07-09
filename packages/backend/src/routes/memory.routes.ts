import { Router, Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { EmbeddingService } from "../services/EmbeddingService.js";

const embedSchema = z.object({
  body: z.object({
    text: z.string().min(1, "Text content is required"),
  }),
});

const searchSchema = z.object({
  body: z.object({
    query: z.string().min(1, "Search query is required"),
    limit: z.number().optional().default(5),
  }),
});

const router = Router();

// POST: Generate Embedding API endpoint (Required in checklist)
router.post("/embed", authenticateToken, validateRequest(embedSchema), async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const { embedding, tokensUsed } = await EmbeddingService.generate(text);
    res.json({ embedding, tokensUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate embedding" });
  }
});

// GET: Paginated Active Memories (Required in checklist)
router.get("/", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [memories, total] = await Promise.all([
      prisma.memory.findMany({
        where: { userId, status: "ACTIVE" },
        skip,
        take: limit,
        orderBy: { tidScore: "desc" }
      }),
      prisma.memory.count({ where: { userId, status: "ACTIVE" } })
    ]);

    res.json({
      memories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve memories" });
  }
});

// GET: Memory stats (Required in checklist)
router.get("/stats", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const activeCount = await prisma.memory.count({ where: { userId, status: "ACTIVE" } });
    const totalCount = await prisma.memory.count({ where: { userId } });
    
    const obitsCount = await prisma.memoryObituary.count({
      where: { memory: { userId } }
    });

    const pendingCount = await prisma.forgettingCheckpoint.count({
      where: { userId, status: "PENDING" }
    });

    const avgTid = await prisma.memory.aggregate({
      where: { userId, status: "ACTIVE" },
      _avg: { tidScore: true }
    });

    res.json({
      totalMemories: totalCount,
      activeMemories: activeCount,
      forgetQueueCount: pendingCount,
      deletedMemoriesCount: obitsCount,
      averageTidScore: avgTid._avg.tidScore || 1.0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve stats" });
  }
});

// GET: Obituaries list (Required in checklist)
router.get("/obituaries", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const obituaries = await prisma.memoryObituary.findMany({
      where: { memory: { userId } },
      include: { memory: true },
      orderBy: { deletedAt: "desc" }
    });

    const formatted = obituaries.map(ob => ({
      id: ob.id,
      memoryId: ob.memoryId,
      originalContent: ob.memory.content,
      summary: ob.summary,
      deletedAt: ob.deletedAt
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve obituaries" });
  }
});

// GET: Single Memory Node details (Required in checklist)
router.get("/:id", authenticateToken, async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const memory = await prisma.memory.findFirst({
      where: { id, userId }
    });

    if (!memory) {
      return res.status(404).json({ error: "Memory node not found" });
    }

    res.json(memory);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve memory node" });
  }
});

// POST: Semantic Similarity Search (Required in checklist)
router.post("/search", authenticateToken, validateRequest(searchSchema), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { query, limit = 5 } = req.body;

    const { embedding: queryVector } = await EmbeddingService.generate(query);

    let results: any[] = [];
    try {
      const vectorString = `[${queryVector.join(",")}]`;
      results = await prisma.$queryRawUnsafe(`
        SELECT id, content, "tidScore", "accessCount", "lastAccessedAt", "createdAt",
               1 - (embedding <=> '${vectorString}'::vector) AS similarity
        FROM "Memory"
        WHERE "userId" = '${userId}' AND status = 'ACTIVE'
        ORDER BY similarity DESC
        LIMIT ${limit}
      `);
    } catch (e) {
      // Fallback
      const allMemories = await prisma.memory.findMany({
        where: { userId, status: "ACTIVE" }
      });
      const scored = allMemories.map(m => {
        const emb = (m as any).embeddingJson ? JSON.parse((m as any).embeddingJson) : [];
        const sim = EmbeddingService.cosineSimilarity(queryVector, emb);
        return {
          id: m.id,
          content: m.content,
          tidScore: m.tidScore,
          accessCount: m.accessCount,
          lastAccessedAt: m.lastAccessedAt,
          createdAt: m.createdAt,
          similarity: sim
        };
      });
      results = scored.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
    }

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Semantic search failed" });
  }
});

// DELETE: Manual delete memory node (Required in checklist)
router.delete("/:id", authenticateToken, async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const memory = await prisma.memory.findFirst({
      where: { id, userId, status: "ACTIVE" }
    });

    if (!memory) {
      return res.status(404).json({ error: "Active memory node not found" });
    }

    // Update status to DELETED
    await prisma.memory.update({
      where: { id },
      data: { status: "DELETED" }
    });

    res.json({ success: true, message: "Memory node manually deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Manual deletion failed" });
  }
});

export default router;
