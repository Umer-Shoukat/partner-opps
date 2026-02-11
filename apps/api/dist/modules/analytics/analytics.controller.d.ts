import { AnalyticsService } from "./analytics.service";
export declare class AnalyticsController {
    private analytics;
    constructor(analytics: AnalyticsService);
    portfolioSummary(asOf?: string): Promise<{
        asOfDay: string;
        apps: {
            id: string;
            name: string;
            slug: string;
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
    partnerReconcile(from: string, to: string, appId?: string): Promise<{
        partner: {
            appId: string;
            day: Date;
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
            appId: string;
            day: Date;
            installs: number;
            uninstalls: number;
            activeInstallsEndOfDay: number;
        }[];
    }>;
    partnerSummary(from: string, to: string): Promise<{
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
