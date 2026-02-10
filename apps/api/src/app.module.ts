import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { AuthModule } from "./modules/auth/auth.module";
import { AppsModule } from "./modules/apps/apps.module";
import { EventsModule } from "./modules/events/events.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { PartnerModule } from "./modules/partner/partner.module";
import { RedisProvider } from "./common/redis/redis.provider";
import { RedisModule } from "./common/redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: { url: process.env.REDIS_URL || "redis://localhost:6379" },
    }),
    AuthModule,
    AppsModule,
    EventsModule,
    AnalyticsModule,
    PartnerModule,
    RedisModule,
  ],
  providers: [RedisProvider],
})
export class AppModule {}
