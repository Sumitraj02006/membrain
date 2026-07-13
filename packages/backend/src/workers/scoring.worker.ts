import { prisma } from "../lib/prisma.js";

class DummyQueue {
  constructor(public name: string, private handler: (job: any) => Promise<void>) {}

  async add(jobName: string, data: any) {
    console.log(`[DummyQueue] Enqueueing scoring job "${jobName}"`);
    setTimeout(async () => {
      try {
        await this.handler({ id: Math.random().toString(), name: jobName, data });
      } catch (err) {
        console.error(`[DummyQueue] Scoring job "${jobName}" failed:`, err);
      }
    }, 0);
    return { id: "dummy-id" };
  }
}

const rescoreJobHandler = async (job: any) => {
  const { userId } = job.data;
  console.log(`[DummyQueue] Starting rescoring job for user: ${userId}`);
  
  // Fetch all active memories for the user
  const activeMemories = await prisma.memory.findMany({
    where: { 
      userId,
      status: "ACTIVE" 
    },
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
            status: "PENDING",
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

  console.log(`[DummyQueue] Rescoring complete. Re-evaluated ${activeMemories.length} nodes.`);
};

export const scoringQueue = new DummyQueue("scoring-queue", rescoreJobHandler) as any;
export const scoringWorker = { close: async () => {} } as any;
