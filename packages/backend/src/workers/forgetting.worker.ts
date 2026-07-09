import { Worker, Queue } from "bullmq";
import { redis } from "../lib/redis.js";
import { prisma } from "../lib/prisma.js";

export const forgettingQueue = new Queue("forgetting-queue", { connection: redis });

export const forgettingWorker = new Worker(
  "forgetting-queue",
  async (job) => {
    console.log(`[BullMQ] Processing forgetting job ${job.id}: ${job.name}`);
    
    if (job.name === "obituary-archive") {
      const { obituaryId, memoryId, summary } = job.data;
      
      // Architectural Honesty: Mock push to Alibaba OSS (will be detailed in oss.ts service)
      console.log(`[BullMQ] Archiving obituary ${obituaryId} for memory ${memoryId} to cold storage.`);
      
      // Update DB record to confirm archiving
      await prisma.memoryObituary.update({
        where: { id: obituaryId },
        data: { ossKey: `obituaries/${obituaryId}.json` }
      });
    }
  },
  { connection: redis }
);
