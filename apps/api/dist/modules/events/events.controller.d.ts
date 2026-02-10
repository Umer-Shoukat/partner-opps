import { Request } from "express";
import { EventsService } from "./events.service";
export declare class EventsController {
    private events;
    constructor(events: EventsService);
    ingest(body: any, req: Request & {
        ingestion?: any;
    }): Promise<{
        accepted: number;
        duplicates: number;
        failed: number;
    }>;
}
