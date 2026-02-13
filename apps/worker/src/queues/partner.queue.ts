import { Queue } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_PARTNER } from "./queue.constants";

export function createPartnerQueue(redisUrl: string) {
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  return new Queue(QUEUE_PARTNER, { connection });
}
