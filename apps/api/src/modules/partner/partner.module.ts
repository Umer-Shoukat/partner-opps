import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { PartnerService } from './partner.service';

@Module({
  providers: [PartnerService, PrismaService],
  exports: [PartnerService],
})
export class PartnerModule {}
