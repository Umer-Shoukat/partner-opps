import { AppsService } from "./apps.service";
export declare class AppsController {
    private apps;
    constructor(apps: AppsService);
    list(): Promise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        partnerAppGid: string | null;
        partnerAppName: string | null;
    }[]>;
    create(body: {
        slug: string;
        name: string;
    }): Promise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        partnerAppGid: string | null;
        partnerAppName: string | null;
    }>;
    createKey(id: string): Promise<{
        keyId: string;
        secret: string;
    }>;
    revokeKey(keyId: string): Promise<{
        id: string;
        createdAt: Date;
        keyId: string;
        appId: string;
        secretHash: string;
        status: import("@prisma/client").$Enums.IngestionKeyStatus;
        revokedAt: Date | null;
    }>;
}
