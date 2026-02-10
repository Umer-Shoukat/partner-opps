import { z } from "zod";
export declare const EventEnvelope: z.ZodObject<{
    event_id: z.ZodString;
    event_type: z.ZodString;
    schema_version: z.ZodDefault<z.ZodNumber>;
    event_ts: z.ZodString;
    app: z.ZodObject<{
        app_slug: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        app_slug: string;
    }, {
        app_slug: string;
    }>;
    shop: z.ZodObject<{
        shopify_shop_id: z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodString]>, bigint, string | number>;
        shop_domain: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        shopify_shop_id: bigint;
        shop_domain: string;
    }, {
        shopify_shop_id: string | number;
        shop_domain: string;
    }>;
    data: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    event_id: string;
    event_type: string;
    schema_version: number;
    event_ts: string;
    app: {
        app_slug: string;
    };
    shop: {
        shopify_shop_id: bigint;
        shop_domain: string;
    };
    data: Record<string, any>;
}, {
    event_id: string;
    event_type: string;
    event_ts: string;
    app: {
        app_slug: string;
    };
    shop: {
        shopify_shop_id: string | number;
        shop_domain: string;
    };
    schema_version?: number | undefined;
    data?: Record<string, any> | undefined;
}>;
export declare const EventsBatch: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        event_id: z.ZodString;
        event_type: z.ZodString;
        schema_version: z.ZodDefault<z.ZodNumber>;
        event_ts: z.ZodString;
        app: z.ZodObject<{
            app_slug: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            app_slug: string;
        }, {
            app_slug: string;
        }>;
        shop: z.ZodObject<{
            shopify_shop_id: z.ZodEffects<z.ZodUnion<[z.ZodNumber, z.ZodString]>, bigint, string | number>;
            shop_domain: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            shopify_shop_id: bigint;
            shop_domain: string;
        }, {
            shopify_shop_id: string | number;
            shop_domain: string;
        }>;
        data: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        event_id: string;
        event_type: string;
        schema_version: number;
        event_ts: string;
        app: {
            app_slug: string;
        };
        shop: {
            shopify_shop_id: bigint;
            shop_domain: string;
        };
        data: Record<string, any>;
    }, {
        event_id: string;
        event_type: string;
        event_ts: string;
        app: {
            app_slug: string;
        };
        shop: {
            shopify_shop_id: string | number;
            shop_domain: string;
        };
        schema_version?: number | undefined;
        data?: Record<string, any> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    events: {
        event_id: string;
        event_type: string;
        schema_version: number;
        event_ts: string;
        app: {
            app_slug: string;
        };
        shop: {
            shopify_shop_id: bigint;
            shop_domain: string;
        };
        data: Record<string, any>;
    }[];
}, {
    events: {
        event_id: string;
        event_type: string;
        event_ts: string;
        app: {
            app_slug: string;
        };
        shop: {
            shopify_shop_id: string | number;
            shop_domain: string;
        };
        schema_version?: number | undefined;
        data?: Record<string, any> | undefined;
    }[];
}>;
export type CanonicalEvent = z.infer<typeof EventEnvelope>;
