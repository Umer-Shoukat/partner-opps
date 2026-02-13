import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { backfillPartner, syncPartnerDay } from "../partner/partner.sync";
import { QUEUE_PARTNER } from "../queues/queue.constants";

export function startPartnerWorker(redisUrl: string) {
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

  const worker = new Worker(
    QUEUE_PARTNER,
    async (job: Job) => {
      if (job.name === "backfill") {
        const { from, to } = job.data as { from: string; to: string };
        console.log(`[partner] backfill start from=${from} to=${to}`);
        await backfillPartner(from, to);
        console.log(`[partner] backfill done from=${from} to=${to}`);
        return;
      }

      if (job.name === "sync_day") {
        const { day } = job.data as { day: string };
        console.log(`[partner] sync_day ${day}`);
        await syncPartnerDay(day);
        console.log(`[partner] sync_day done ${day}`);
        return;
      }

      throw new Error(`Unknown job: ${job.name}`);
    },
    { connection },
  );

  worker.on("failed", (job, err) => {
    console.error(`[partner] job failed name=${job?.name} id=${job?.id}`, err);
  });

  worker.on("completed", (job) => {
    console.log(`[partner] job completed name=${job.name} id=${job.id}`);
  });

  return worker;
}
