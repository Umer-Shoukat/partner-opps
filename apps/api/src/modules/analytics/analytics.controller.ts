import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
@UseGuards(AuthGuard("jwt"))
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get("portfolio/summary")
  async portfolioSummary(@Query("asOf") asOf?: string) {
    return this.analytics.portfolioSummary(asOf ? new Date(asOf) : new Date());
  }

  @Get("reconcile/partner")
  async partnerReconcile(
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("appId") appId?: string,
  ) {
    return this.analytics.partnerReconcile(new Date(from), new Date(to), appId);
  }

  @Get("/partner/summary")
  async partnerSummary(@Query("from") from: string, @Query("to") to: string) {
    return this.analytics.partnerSummary(from, to);
  }
}
