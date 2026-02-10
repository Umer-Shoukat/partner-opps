import { PrismaService } from "../../common/db/prisma.service";
export declare class PartnerService {
    private prisma;
    constructor(prisma: PrismaService);
    fetchDailyMetrics(day: string): Promise<any>;
}
