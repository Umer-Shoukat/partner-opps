import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import IORedis from "ioredis";
import { BULLMQ_CONNECTION } from "./queues.constants";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BULLMQ_CONNECTION,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const url = cfg.get<string>("REDIS_URL")!;
        return new IORedis(url, { maxRetriesPerRequest: null });
      },
    },
  ],
  exports: [BULLMQ_CONNECTION],
})
export class QueuesModule {}
