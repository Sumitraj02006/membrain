import { prisma } from "../lib/prisma.js";

class DummyQueue {
  constructor(public name: string, private handler: (job: any) => Promise<void>) {}

  async add(jobName: string, data: any) {
    console.log(`[DummyQueue] Enqueueing forgetting job "${jobName}"`);
    setTimeout(async () => {
      try {
        await this.handler({ id: Math.random().toString(), name: jobName, data });
      } catch (err) {
        console.error(`[DummyQueue] Forgetting job "${jobName}" failed:`, err);
      }
    }, 0);
    return { id: "dummy-id" };
  }
}

const forgettingJobHandler = async (job: any) => {
  if (job.name === "obituary-archive") {
    const { obituaryId, memoryId } = job.data;
    console.log(`[DummyQueue] Archiving obituary ${obituaryId} for memory ${memoryId} to cold storage.`);
    
    // Update DB record to confirm archiving
    await prisma.memoryObituary.update({
      where: { id: obituaryId },
      data: { ossKey: `obituaries/${obituaryId}.json` }
    });
  }
};

export const forgettingQueue = new DummyQueue("forgetting-queue", forgettingJobHandler) as any;
export const forgettingWorker = { close: async () => {} } as any;
