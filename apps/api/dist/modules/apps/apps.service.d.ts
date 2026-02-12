import { PrismaService } from "../../common/db/prisma.service";
import { UpdateAppDto } from "./dto/update-app.dto";
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
        appId: string;
        keyId: string;
        secretHash: string;
        status: import("@prisma/client").$Enums.IngestionKeyStatus;
        revokedAt: Date | null;
    }>;
    update(id: string, dto: UpdateAppDto): Promise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        partnerAppGid: string | null;
        partnerAppName: string | null;
    }>;
}
