import { Worker, Queue } from "bullmq";
import { redis } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";
import { AgentService } from "../services/AgentService.js";

export const scoringQueue = new Queue("scoring-queue", { connection: redis });

// Nightly cron job worker to automatically recalculate TID scores
export const scoringWorker = new Worker(
  "scoring-queue",
  async (job) => {
    console.log(`[BullMQ] Starting nightly rescoring job: ${job.id}`);
    
    // Fetch all active memories
    const activeMemories = await prisma.memory.findMany({
      where: { status: "ACTIVE" },
      include: { user: { include: { profile: true } } }
    });

    const now = new Date();

    for (const mem of activeMemories) {
      const profile = mem.user.profile || {
        alphaWeight: 0.25,
        betaWeight: 0.35,
        gammaWeight: 0.30,
        deltaWeight: 0.10,
        lambdaDecay: 0.01,
        forgetThreshold: 0.15
      };

      const createdTime = new Date(mem.createdAt).getTime();
      const accessedTime = new Date(mem.lastAccessedAt).getTime();

      const deltaT = Math.max(0, (now.getTime() - createdTime) / (1000 * 60 * 60 * 24));
      const deltaTAccess = Math.max(0, (now.getTime() - accessedTime) / (1000 * 60 * 60 * 24));

      // Calculate scores
      const recencyScore = Math.exp(-0.15 * deltaTAccess);
      const ageDecay = Math.exp(-profile.lambdaDecay * deltaT);
      const goalScore = mem.goalScore;
      const noiseScore = mem.noiseScore;

      const rawScore = (profile.alphaWeight * recencyScore) + 
                       (profile.betaWeight * ageDecay) + 
                       (profile.gammaWeight * goalScore) - 
                       (profile.deltaWeight * noiseScore);

      const score = Math.max(0, Math.min(1.0, rawScore));

      // Update in database
      await prisma.memory.update({
        where: { id: mem.id },
        data: {
          tidScore: score,
          recencyScore
        }
      });

      // If score falls below forget threshold, queue for forgetting proposal
      if (score < profile.forgetThreshold) {
        // Mark memory status as PENDING_DELETION
        await prisma.memory.update({
          where: { id: mem.id },
          data: { status: "PENDING_DELETION" }
        });

        // Search for existing pending checkpoints
        const existingCheckpoint = await prisma.forgettingCheckpoint.findFirst({
          where: {
            userId: mem.userId,
            status: "PENDING",
            proposals: { some: { memoryId: mem.id } }
          }
        });

        if (!existingCheckpoint) {
          // Create new checkpoint
          const checkpoint = await prisma.forgettingCheckpoint.create({
            data: {
              userId: mem.userId,
              expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24h expiration
            }
          });

          await prisma.forgettingProposal.create({
            data: {
              checkpointId: checkpoint.id,
              memoryId: mem.id,
              tidScore: score,
              reason: "temporal_decay"
            }
          });
        }
      }
    }

    console.log(`[BullMQ] Nightly rescoring complete. Re-evaluated ${activeMemories.length} nodes.`);
  },
  { connection: redis }
);
