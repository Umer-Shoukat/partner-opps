import { z } from "zod";

export const EventEnvelope = z.object({
  event_id: z.string().min(8),
  event_type: z.string().min(3),
  schema_version: z.number().int().min(1).default(1),
  event_ts: z.string().datetime(),
  app: z.object({
    app_slug: z.string().min(2)
  }),
  shop: z.object({
    shopify_shop_id: z.union([z.number().int().positive(), z.string()]).transform((v) => BigInt(v)),
    shop_domain: z.string().min(3)
  }),
  data: z.record(z.any()).default({})
});

export const EventsBatch = z.object({
  events: z.array(EventEnvelope).min(1).max(200)
});

export type CanonicalEvent = z.infer<typeof EventEnvelope>;
