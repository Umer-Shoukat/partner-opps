import { PrismaService } from "../../common/db/prisma.service";
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    portfolioSummary(asOf: Date): Promise<{
        asOfDay: string;
        apps: {
            id: string;
            slug: string;
            name: string;
        }[];
        installs: number;
        uninstalls: number;
        activeInstalls: number;
        mrrByCurrency: {
            currency: string;
            mrr: string;
            arr: string;
        }[];
    }>;
    partnerReconcile(from: Date, to: Date, appId?: string): Promise<{
        partner: {
            day: Date;
            appId: string;
            installs: number | null;
            uninstalls: number | null;
            currency: string;
            activeInstalls: number | null;
            revenueGross: import("@prisma/client/runtime/library").Decimal | null;
            revenueNet: import("@prisma/client/runtime/library").Decimal | null;
            fetchedAt: Date;
            raw: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        hubInstall: {
            createdAt: Date;
            day: Date;
            appId: string;
            installs: number;
            uninstalls: number;
            activeInstallsEndOfDay: number;
        }[];
    }>;
    partnerSummary(fromIso: string, toIso: string): Promise<{
        range: {
            from: string;
            to: string;
        };
        series: any[];
        byApp: {
            day: string;
            appId: string;
            appName: string;
            installs: number | null;
            uninstalls: number | null;
            activeInstalls: number | null;
            revenueGross: import("@prisma/client/runtime/library").Decimal | null;
            revenueNet: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
        }[];
    }>;
}
