import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analytics;
    constructor(analytics: AnalyticsService);
    portfolioSummary(asOf?: string): Promise<{
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
    partnerReconcile(from: string, to: string, appId?: string): Promise<{
        partner: {
            appId: string;
            currency: string;
            day: Date;
            installs: number | null;
            uninstalls: number | null;
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
}
