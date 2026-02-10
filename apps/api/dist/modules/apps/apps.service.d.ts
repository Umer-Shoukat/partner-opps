import { PrismaService } from '../../common/db/prisma.service';
export declare class AppsService {
    private prisma;
    constructor(prisma: PrismaService);
    list(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        partnerAppGid: string | null;
        partnerAppName: string | null;
    }[]>;
    create(input: {
        slug: string;
        name: string;
    }): import("@prisma/client").Prisma.Prisma__AppClient<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        partnerAppGid: string | null;
        partnerAppName: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createIngestionKey(appId: string): Promise<{
        keyId: string;
        secret: string;
    }>;
    revokeKey(keyId: string): Promise<{
        id: string;
        createdAt: Date;
        keyId: string;
        secretHash: string;
        status: import("@prisma/client").$Enums.IngestionKeyStatus;
        revokedAt: Date | null;
        appId: string;
    }>;
}
