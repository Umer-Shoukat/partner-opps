"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionHmacGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
const redis_constants_1 = require("../redis/redis.constants");
const hmac_1 = require("../crypto/hmac");
let IngestionHmacGuard = class IngestionHmacGuard {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async canActivate(ctx) {
        const req = ctx
            .switchToHttp()
            .getRequest();
        const keyId = req.header("X-App-Key-Id");
        const ts = req.header("X-App-Timestamp");
        const nonce = req.header("X-App-Nonce");
        const sig = req.header("X-App-Signature");
        if (!keyId || !ts || !nonce || !sig) {
            throw new common_1.UnauthorizedException("missing_headers");
        }
        const windowMs = Number(process.env.INGESTION_REPLAY_WINDOW_MS ?? 300000);
        const now = Date.now();
        const tsNum = Number(ts);
        if (!Number.isFinite(tsNum) || Math.abs(now - tsNum) > windowMs) {
            throw new common_1.UnauthorizedException("timestamp_outside_window");
        }
        const nonceTtl = Number(process.env.INGESTION_NONCE_TTL_SECONDS ?? 300);
        const nonceKey = `nonce:${keyId}:${nonce}`;
        const setRes = await this.redis.set(nonceKey, "1", "NX", "EX", nonceTtl);
        if (setRes !== "OK") {
            throw new common_1.UnauthorizedException("replayed_nonce");
        }
        const keyRow = await this.prisma.appIngestionKey.findUnique({
            where: { keyId },
        });
        if (!keyRow || keyRow.status !== "active") {
            throw new common_1.UnauthorizedException("invalid_key");
        }
        const secret = keyRow.secretHash;
        const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
        const bodyHash = (0, hmac_1.sha256Hex)(rawBody);
        const method = (req.method || "POST").toUpperCase();
        const path = req.originalUrl.split("?")[0];
        const signingString = `${ts}.${nonce}.${method}.${path}.${bodyHash}`;
        const expected = (0, hmac_1.hmacSha256Hex)(secret, signingString);
        if (!(0, hmac_1.timingSafeEqualHex)(expected, sig)) {
            throw new common_1.UnauthorizedException("bad_signature");
        }
        req.ingestion = { appId: keyRow.appId, keyId };
        return true;
    }
};
exports.IngestionHmacGuard = IngestionHmacGuard;
exports.IngestionHmacGuard = IngestionHmacGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(redis_constants_1.REDIS)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Function])
], IngestionHmacGuard);
//# sourceMappingURL=ingestion-hmac.guard.js.map