import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "../db/prisma.service";
// import { REDIS } from "../redis/redis.provider";
import { REDIS } from "../redis/redis.constants";
import type Redis from "ioredis";
import { sha256Hex, hmacSha256Hex, timingSafeEqualHex } from "../crypto/hmac";

@Injectable()
export class IngestionHmacGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    @Inject(REDIS) private redis: Redis,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { rawBody?: Buffer; ingestion?: any }>();

    const keyId = req.header("X-App-Key-Id");
    const ts = req.header("X-App-Timestamp");
    const nonce = req.header("X-App-Nonce");
    const sig = req.header("X-App-Signature");

    if (!keyId || !ts || !nonce || !sig) {
      throw new UnauthorizedException("missing_headers");
    }

    const windowMs = Number(process.env.INGESTION_REPLAY_WINDOW_MS ?? 300000);
    const now = Date.now();
    const tsNum = Number(ts);
    if (!Number.isFinite(tsNum) || Math.abs(now - tsNum) > windowMs) {
      throw new UnauthorizedException("timestamp_outside_window");
    }

    // Replay protection
    const nonceTtl = Number(process.env.INGESTION_NONCE_TTL_SECONDS ?? 300);
    const nonceKey = `nonce:${keyId}:${nonce}`;
    // const setRes = await this.redis.set(nonceKey, "1", "NX", "EX", nonceTtl);
    const setRes = await this.redis.set(
      nonceKey,
      "1",
      "NX" as any,
      "EX" as any,
      nonceTtl as any,
    );

    if (setRes !== "OK") {
      throw new UnauthorizedException("replayed_nonce");
    }

    const keyRow = await this.prisma.appIngestionKey.findUnique({
      where: { keyId },
    });
    if (!keyRow || keyRow.status !== "active") {
      throw new UnauthorizedException("invalid_key");
    }

    // NOTE: for MVP, `secretHash` is treated as the shared secret.
    // In production: store this secret in a vault, and keep only a reference+hash here.
    const secret = keyRow.secretHash;

    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
    const bodyHash = sha256Hex(rawBody);

    const method = (req.method || "POST").toUpperCase();
    const path = req.originalUrl.split("?")[0];
    const signingString = `${ts}.${nonce}.${method}.${path}.${bodyHash}`;

    const expected = hmacSha256Hex(secret, signingString);
    if (!timingSafeEqualHex(expected, sig)) {
      throw new UnauthorizedException("bad_signature");
    }

    req.ingestion = { appId: keyRow.appId, keyId };
    return true;
  }
}
