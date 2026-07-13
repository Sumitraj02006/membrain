import { Router, Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { AgentService } from "../services/AgentService.js";
import { OSSService } from "../lib/oss.js";
import { emitUserEvent } from "../socket/gateway.js";
import { forgettingQueue } from "../workers/forgetting.worker.js";

const settingsSchema = z.object({
  body: z.object({
    domain: z.string().optional(),
    lambdaDecay: z.number().optional(),
    forgetThreshold: z.number().optional(),
    alphaWeight: z.number().optional(),
    betaWeight: z.number().optional(),
    gammaWeight: z.number().optional(),
    deltaWeight: z.number().optional(),
  }),
});

const obituarySchema = z.object({
  body: z.object({
    content: z.string().min(1, "Memory content is required"),
  }),
});

const router = Router();

// Generate a compressed single-sentence obituary for a given memory content
router.post("/obituary", authenticateToken, validateRequest(obituarySchema), async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const { summary, tokensUsed } = await AgentService.generateObituary(content);
    res.json({ summary, tokensUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate obituary" });
  }
});

// GET: Fetch pending checkpoints (Forgetting Proposals)
router.get("/pending", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const checkpoints = await prisma.forgettingCheckpoint.findMany({
      where: { userId, status: "PENDING" },
      include: { proposals: true },
      orderBy: { createdAt: "desc" }
    });

    // Flatten representation for frontend compatibility
    const formatted = checkpoints.flatMap(cp => {
      return cp.proposals.map(prop => ({
        id: cp.id,
        proposalId: prop.id,
        memoryId: prop.memoryId,
        userId: cp.userId,
        content: `Pending decay candidate: ${prop.memoryId}`, // we can pull from Memory content in production
        tidScore: prop.tidScore,
        reason: prop.reason,
        createdAt: cp.createdAt
      }));
    });

    // Pull contents of memories for formatted representation
    const result = [];
    for (const item of formatted) {
      const memory = await prisma.memory.findUnique({ where: { id: item.memoryId } });
      result.push({
        ...item,
        content: memory ? memory.content : "Cognitive shard enqueued."
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve pending checkpoints" });
  }
});

// POST: Approve checkpoint (Forget & Obituary)
router.post("/:id/approve", authenticateToken, async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const checkpoint = await prisma.forgettingCheckpoint.findFirst({
      where: { id, userId, status: "PENDING" },
      include: { proposals: true }
    });

    if (!checkpoint) {
      return res.status(404).json({ error: "Pending checkpoint not found" });
    }

    for (const proposal of checkpoint.proposals) {
      const memory = await prisma.memory.findFirst({
        where: { id: proposal.memoryId, userId }
      });

      if (memory && memory.status !== "DELETED") {
        // 1. Generate obituary summary via Qwen-Max
        const { summary, tokensUsed } = await AgentService.generateObituary(memory.content);

        // 2. Upload obituary to Alibaba OSS
        const ossKey = await OSSService.uploadObituary(proposal.id, {
          memoryId: memory.id,
          content: memory.content,
          summary,
          purgedAt: new Date().toISOString()
        });

        // 3. Register obituary in DB
        const obit = await prisma.memoryObituary.create({
          data: {
            memoryId: memory.id,
            summary,
            originalTokens: memory.contentTokens,
            summaryTokens: Math.ceil(summary.length / 4),
            compressionRatio: memory.contentTokens / Math.max(1, Math.ceil(summary.length / 4)),
            ossKey
          }
        });

        // 4. Mark memory as DELETED and scrub semantic embedding
        await prisma.memory.update({
          where: { id: memory.id },
          data: {
            status: "DELETED",
            embeddingJson: null // Wipes local mock embedding vector
          }
        });

        // Enqueue background archiver job in BullMQ forgetting queue
        await forgettingQueue.add("obituary-archive", {
          obituaryId: obit.id,
          memoryId: memory.id,
          summary
        });
      }
    }

    // Update checkpoint status
    await prisma.forgettingCheckpoint.update({
      where: { id },
      data: { status: "APPROVED", resolvedAt: new Date() }
    });

    // Adaptive Lambda Decay: Slightly speed up decay or keep nominal (feedback says decay was correct)
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (profile) {
      const newLambda = Math.min(0.1, profile.lambdaDecay + 0.0005);
      await prisma.userProfile.update({
        where: { userId },
        data: { lambdaDecay: newLambda }
      });
    }

    emitUserEvent(userId, "memory_updated");
    res.json({ success: true, message: "Decay approved, obituary generated and uploaded." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to approve checkpoint" });
  }
});

// POST: Reject checkpoint (Keep Memory)
router.post("/:id/reject", authenticateToken, async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const checkpoint = await prisma.forgettingCheckpoint.findFirst({
      where: { id, userId, status: "PENDING" },
      include: { proposals: true }
    });

    if (!checkpoint) {
      return res.status(404).json({ error: "Pending checkpoint not found" });
    }

    // Boost scores and restore memory ACTIVE status
    for (const proposal of checkpoint.proposals) {
      await prisma.memory.update({
        where: { id: proposal.memoryId },
        data: {
          status: "ACTIVE",
          tidScore: 0.85, // High priority boost
          lastAccessedAt: new Date(),
          accessCount: { increment: 1 }
        }
      });
    }

    // Update checkpoint status to REJECTED
    await prisma.forgettingCheckpoint.update({
      where: { id },
      data: { status: "REJECTED", resolvedAt: new Date() }
    });

    // Adaptive Lambda Decay: User wanted to keep it. Decay was too fast! Reduce lambda.
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (profile) {
      const newLambda = Math.max(0.001, profile.lambdaDecay - 0.002);
      await prisma.userProfile.update({
        where: { userId },
        data: { lambdaDecay: newLambda }
      });
    }

    emitUserEvent(userId, "memory_updated");
    res.json({ success: true, message: "Decay rejected. Memory engram scores boosted.", newLambda: profile ? Math.max(0.001, profile.lambdaDecay - 0.002) : 0.01 });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reject checkpoint" });
  }
});

// POST: Approve all enqueued checkpoints
router.post("/approve-all", authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const pending = await prisma.forgettingCheckpoint.findMany({
      where: { userId, status: "PENDING" }
    });

    for (const cp of pending) {
      // Reuse approve handler logic
      const checkpoint = await prisma.forgettingCheckpoint.findUnique({
        where: { id: cp.id },
        include: { proposals: true }
      });

      if (checkpoint) {
        for (const proposal of checkpoint.proposals) {
          const memory = await prisma.memory.findFirst({
            where: { id: proposal.memoryId, userId }
          });

          if (memory && memory.status !== "DELETED") {
            const { summary } = await AgentService.generateObituary(memory.content);
            const ossKey = await OSSService.uploadObituary(proposal.id, {
              memoryId: memory.id,
              content: memory.content,
              summary
            });
            const obit = await prisma.memoryObituary.create({
              data: {
                memoryId: memory.id,
                summary,
                originalTokens: memory.contentTokens,
                summaryTokens: Math.ceil(summary.length / 4),
                compressionRatio: memory.contentTokens / Math.max(1, Math.ceil(summary.length / 4)),
                ossKey
              }
            });
            await prisma.memory.update({
              where: { id: memory.id },
              data: { status: "DELETED", embeddingJson: null }
            });
            await forgettingQueue.add("obituary-archive", {
              obituaryId: obit.id,
              memoryId: memory.id,
              summary
            });
          }
        }
        await prisma.forgettingCheckpoint.update({
          where: { id: cp.id },
          data: { status: "APPROVED", resolvedAt: new Date() }
        });
      }
    }

    emitUserEvent(userId, "memory_updated");
    res.json({ success: true, message: "Approved all checkpoints." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to approve all checkpoints" });
  }
});

// PUT: Update user profile settings (TID parameters)
router.put("/settings", authenticateToken, validateRequest(settingsSchema), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: updateData
    });

    res.json(updatedProfile);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update settings" });
  }
});

export default router;
