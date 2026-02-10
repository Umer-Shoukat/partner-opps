"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsBatch = exports.EventEnvelope = void 0;
const zod_1 = require("zod");
exports.EventEnvelope = zod_1.z.object({
    event_id: zod_1.z.string().min(8),
    event_type: zod_1.z.string().min(3),
    schema_version: zod_1.z.number().int().min(1).default(1),
    event_ts: zod_1.z.string().datetime(),
    app: zod_1.z.object({
        app_slug: zod_1.z.string().min(2)
    }),
    shop: zod_1.z.object({
        shopify_shop_id: zod_1.z.union([zod_1.z.number().int().positive(), zod_1.z.string()]).transform((v) => BigInt(v)),
        shop_domain: zod_1.z.string().min(3)
    }),
    data: zod_1.z.record(zod_1.z.any()).default({})
});
exports.EventsBatch = zod_1.z.object({
    events: zod_1.z.array(exports.EventEnvelope).min(1).max(200)
});
