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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ingestBatch(appId, events) {
        let accepted = 0, duplicates = 0, failed = 0;
        for (const e of events) {
            try {
                const merchant = await this.upsertMerchant(e.shop.shopify_shop_id, e.shop.shop_domain);
                await this.applyEvent(appId, merchant.id, e);
                accepted++;
            }
            catch (err) {
                if (String(err?.code) === "P2002")
                    duplicates++;
                else
                    failed++;
            }
        }
        return { accepted, duplicates, failed };
    }
    upsertMerchant(shopifyShopId, shopDomain) {
        return this.prisma.merchant.upsert({
            where: { shopifyShopId },
            create: {
                shopifyShopId,
                shopDomain,
                firstSeenAt: new Date(),
                lastSeenAt: new Date(),
            },
            update: { shopDomain, lastSeenAt: new Date() },
        });
    }
    async applyEvent(appId, merchantId, e) {
        const eventTs = new Date(e.event_ts);
        await this.prisma.event.create({
            data: {
                eventId: e.event_id,
                appId,
                merchantId,
                eventType: e.event_type,
                eventTs,
                schemaVersion: e.schema_version,
                payload: e,
                source: "push",
            },
        });
        if (e.event_type === "app.install.created") {
            await this.prisma.merchantApp.upsert({
                where: { merchantId_appId: { merchantId, appId } },
                create: {
                    merchantId,
                    appId,
                    status: "installed",
                    installedAt: eventTs,
                    lastEventAt: eventTs,
                },
                update: {
                    status: "installed",
                    installedAt: eventTs,
                    uninstalledAt: null,
                    lastEventAt: eventTs,
                },
            });
        }
        if (e.event_type === "app.install.deleted") {
            await this.prisma.merchantApp.upsert({
                where: { merchantId_appId: { merchantId, appId } },
                create: {
                    merchantId,
                    appId,
                    status: "uninstalled",
                    uninstalledAt: eventTs,
                    lastEventAt: eventTs,
                },
                update: {
                    status: "uninstalled",
                    uninstalledAt: eventTs,
                    lastEventAt: eventTs,
                },
            });
        }
        if (e.event_type.startsWith("billing.subscription.")) {
            const d = e.data || {};
            const shopifySubscriptionId = String(d.shopify_subscription_id);
            await this.prisma.subscription.upsert({
                where: { shopifySubscriptionId },
                create: {
                    appId,
                    merchantId,
                    shopifySubscriptionId,
                    status: d.status || "active",
                    planCode: d.plan_code || "unknown",
                    planName: d.plan_name || "unknown",
                    currency: d.currency || "USD",
                    interval: d.interval || "EVERY_30_DAYS",
                    price: d.price || "0",
                    cappedAmount: d.capped_amount || null,
                    trialEndsAt: d.trial_ends_at ? new Date(d.trial_ends_at) : null,
                    activatedAt: d.activated_at ? new Date(d.activated_at) : null,
                    cancelledAt: d.cancelled_at ? new Date(d.cancelled_at) : null,
                    currentPeriodStart: d.current_period_start
                        ? new Date(d.current_period_start)
                        : null,
                    currentPeriodEnd: d.current_period_end
                        ? new Date(d.current_period_end)
                        : null,
                },
                update: {
                    status: d.status || undefined,
                    planCode: d.plan_code || undefined,
                    planName: d.plan_name || undefined,
                    currency: d.currency || undefined,
                    interval: d.interval || undefined,
                    price: d.price || undefined,
                    cappedAmount: d.capped_amount || undefined,
                    trialEndsAt: d.trial_ends_at ? new Date(d.trial_ends_at) : undefined,
                    activatedAt: d.activated_at ? new Date(d.activated_at) : undefined,
                    cancelledAt: d.cancelled_at ? new Date(d.cancelled_at) : undefined,
                    currentPeriodStart: d.current_period_start
                        ? new Date(d.current_period_start)
                        : undefined,
                    currentPeriodEnd: d.current_period_end
                        ? new Date(d.current_period_end)
                        : undefined,
                },
            });
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map