import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

@Module({
  controllers: [AppsController],
  providers: [AppsService, PrismaService],
  exports: [AppsService],
})
export class AppsModule {}
