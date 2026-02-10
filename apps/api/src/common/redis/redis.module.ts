import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { REDIS } from "./redis.constants";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis(config.get<string>("REDIS_URL")!, {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
        });
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
