import { CanActivate, ExecutionContext } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service";
import type Redis from "ioredis";
export declare class IngestionHmacGuard implements CanActivate {
    private prisma;
    private redis;
    constructor(prisma: PrismaService, redis: Redis);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
