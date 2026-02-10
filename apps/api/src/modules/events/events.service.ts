import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/db/prisma.service";
import type { CanonicalEvent } from "@appops/shared";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async ingestBatch(appId: string, events: CanonicalEvent[]) {
    let accepted = 0,
      duplicates = 0,
      failed = 0;

    for (const e of events) {
      try {
        const merchant = await this.upsertMerchant(
          e.shop.shopify_shop_id,
          e.shop.shop_domain,
        );
        await this.applyEvent(appId, merchant.id, e);
        accepted++;
      } catch (err: any) {
        if (String(err?.code) === "P2002") duplicates++;
        else failed++;
      }
    }

    return { accepted, duplicates, failed };
  }

  private upsertMerchant(shopifyShopId: bigint, shopDomain: string) {
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

  private async applyEvent(
    appId: string,
    merchantId: string,
    e: CanonicalEvent,
  ) {
    const eventTs = new Date(e.event_ts);

    await this.prisma.event.create({
      data: {
        eventId: e.event_id,
        appId,
        merchantId,
        eventType: e.event_type,
        eventTs,
        schemaVersion: e.schema_version,
        payload: e as any,
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
      const d: any = e.data || {};
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
}
