import { Inject, Injectable } from "@nestjs/common";
import { Queue, type JobsOptions } from "bullmq";
import type IORedis from "ioredis";
import {
  BULLMQ_CONNECTION,
  QUEUE_PARTNER,
} from "../../common/queues/queues.constants";

function safeId(input: string) {
  // BullMQ disallows ":" and a few other unsafe chars. Keep it simple.
  return input.replace(/[^a-zA-Z0-9-_]/g, "-");
}

@Injectable()
export class PartnerJobsService {
  private readonly queue: Queue;

  constructor(@Inject(BULLMQ_CONNECTION) connection: IORedis) {
    this.queue = new Queue(QUEUE_PARTNER, { connection });
  }

  private defaultOpts(jobId: string): JobsOptions {
    return {
      jobId: safeId(jobId),
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 2000 },
      attempts: 3,
      backoff: { type: "exponential", delay: 5_000 },
    };
  }

  // async enqueueBackfill(from: string, to: string) {
  //   return this.queue.add<BackfillPayload>(
  //     "backfill",
  //     { from, to },
  //     this.defaultOpts(`partner-backfill-${from}-${to}`),
  //   );
  // }

  // async enqueueSyncDay(day: string) {
  //   return this.queue.add<SyncDayPayload>(
  //     "sync_day",
  //     { day },
  //     this.defaultOpts(`partner-syncday-${day}`),
  //   );
  // }

  async enqueueBackfill(from: string, to: string) {
    return this.queue.add(
      "backfill",
      { from, to },
      this.defaultOpts(`partner-backfill-${from}-${to}`),
    );
  }

  async enqueueSyncDay(day: string) {
    return this.queue.add(
      "sync_day",
      { day },
      this.defaultOpts(`partner-syncday-${day}`),
    );
  }
}
