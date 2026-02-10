import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { IngestionHmacGuard } from "../../common/auth/ingestion-hmac.guard";
import { EventsBatch } from "@appops/shared";
import { EventsService } from "./events.service";

@Controller()
export class EventsController {
  constructor(private events: EventsService) {}

  @Post("/events")
  @UseGuards(IngestionHmacGuard)
  async ingest(@Body() body: any, @Req() req: Request & { ingestion?: any }) {
    const parsed = EventsBatch.parse(body);
    const appId = req.ingestion?.appId;
    return this.events.ingestBatch(appId, parsed.events);
  }
}
