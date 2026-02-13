import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/db/prisma.service";
import { PartnerService } from "./partner.service";
import { PartnerController } from "./partner.controller";
import { PartnerJobsService } from "./partner.jobs";
@Module({
  controllers: [PartnerController],
  providers: [PartnerService, PrismaService, PartnerJobsService],
  exports: [PartnerService],
})
export class PartnerModule {}
