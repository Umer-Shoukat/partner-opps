import { PrismaService } from "../../common/db/prisma.service";
import type { CanonicalEvent } from "@appops/shared";
export declare class EventsService {
    private prisma;
    constructor(prisma: PrismaService);
    ingestBatch(appId: string, events: CanonicalEvent[]): Promise<{
        accepted: number;
        duplicates: number;
        failed: number;
    }>;
    private upsertMerchant;
    private applyEvent;
}
