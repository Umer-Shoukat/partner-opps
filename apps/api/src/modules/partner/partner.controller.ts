import { Body, Controller, Post, UseGuards } from "@nestjs/common";
// import { JwtAuthGuard } from "../../common/auth/ingestion-hmac.guard";
import { AuthGuard } from "@nestjs/passport";

// import { JwtAuthGuard } from "/../common/auth/jwt.guard";
import { PartnerJobsService } from "./partner.jobs";

@UseGuards(AuthGuard)
@Controller("partner")
export class PartnerController {
  constructor(private jobs: PartnerJobsService) {}

  @Post("backfill")
  async backfill(@Body() body: { from: string; to: string }) {
    const job = await this.jobs.enqueueBackfill(body.from, body.to);
    return { queued: true, jobId: job.id, name: job.name };
  }

  @Post("sync-day")
  async syncDay(@Body() body: { day: string }) {
    const job = await this.jobs.enqueueSyncDay(body.day);
    return { queued: true, jobId: job.id, name: job.name };
  }
}
