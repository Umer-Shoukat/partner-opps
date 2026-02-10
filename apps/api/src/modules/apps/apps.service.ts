import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/db/prisma.service";
import crypto from "crypto";
import { UpdateAppDto } from "./dto/update-app.dto";

@Injectable()
export class AppsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.app.findMany({ orderBy: { createdAt: "desc" } });
  }

  create(input: { slug: string; name: string }) {
    return this.prisma.app.create({ data: input });
  }

  async createIngestionKey(appId: string) {
    const keyId = `key_${crypto.randomBytes(8).toString("hex")}`;
    const secret = crypto.randomBytes(32).toString("hex");
    // MVP: store secret in secretHash. In production: store hash+vault reference.
    await this.prisma.appIngestionKey.create({
      data: { appId, keyId, secretHash: secret },
    });
    return { keyId, secret };
  }

  async revokeKey(keyId: string) {
    return this.prisma.appIngestionKey.update({
      where: { keyId },
      data: { status: "revoked", revokedAt: new Date() },
    });
  }

  async update(id: string, dto: UpdateAppDto) {
    return this.prisma.app.update({
      where: { id },
      data: {
        partnerAppGid: dto.partnerAppGid ?? undefined,
        partnerAppName: dto.partnerAppName ?? undefined,
      },
    });
  }
}
