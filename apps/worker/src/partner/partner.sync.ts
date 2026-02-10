import { PrismaClient } from "@prisma/client";
import { partnerGraphql } from "./partner.client";

const prisma = new PrismaClient();

type PartnerMetricsResponse = {
  organization: {
    id: string;
  };
  app: {
    id: string;
    name: string;
    // NOTE: field names vary by Partner API schema version.
    // We’ll query a simple daily report shape and adjust if needed.
    dailyMetrics: Array<{
      date: string;
      installs: number | null;
      uninstalls: number | null;
      activeInstalls: number | null;
      grossRevenue: { amount: string; currencyCode: string } | null;
      netRevenue: { amount: string; currencyCode: string } | null;
    }>;
  } | null;
};

export async function syncPartnerDay(dayIso: string) {
  const orgId = process.env.SHOPIFY_PARTNER_ORG_ID;
  if (!orgId) throw new Error("Missing SHOPIFY_PARTNER_ORG_ID");

  const apps = await prisma.app.findMany({
    where: { partnerAppGid: { not: null } },
  });

  for (const app of apps) {
    const query = `
      query DailyAppMetrics($orgId: ID!, $appId: ID!, $date: Date!) {
        organization(id: $orgId) { id }
        app(id: $appId) {
          id
          name
          dailyMetrics(date: $date) {
            date
            installs
            uninstalls
            activeInstalls
            grossRevenue { amount currencyCode }
            netRevenue { amount currencyCode }
          }
        }
      }
    `;

    const data = await partnerGraphql<PartnerMetricsResponse>(query, {
      orgId: `gid://shopify/Organization/${orgId}`,
      appId: app.partnerAppGid,
      date: dayIso,
    });

    if (!data.app) continue;

    const row = data.app.dailyMetrics?.[0];
    if (!row) continue;

    const currency =
      row.grossRevenue?.currencyCode ?? row.netRevenue?.currencyCode ?? "USD";

    await prisma.partnerDailyMetric.upsert({
      where: {
        day_appId_currency: {
          day: new Date(dayIso),
          appId: app.id,
          currency,
        },
      },
      create: {
        day: new Date(dayIso),
        appId: app.id,
        currency,
        installs: row.installs ?? null,
        uninstalls: row.uninstalls ?? null,
        activeInstalls: row.activeInstalls ?? null,
        revenueGross: row.grossRevenue?.amount ? row.grossRevenue.amount : null,
        revenueNet: row.netRevenue?.amount ? row.netRevenue.amount : null,
        raw: row as any,
      },
      update: {
        installs: row.installs ?? null,
        uninstalls: row.uninstalls ?? null,
        activeInstalls: row.activeInstalls ?? null,
        revenueGross: row.grossRevenue?.amount ? row.grossRevenue.amount : null,
        revenueNet: row.netRevenue?.amount ? row.netRevenue.amount : null,
        fetchedAt: new Date(),
        raw: row as any,
      },
    });

    // also store partner app name for convenience
    await prisma.app.update({
      where: { id: app.id },
      data: { partnerAppName: data.app.name },
    });
  }
}

export async function backfillPartner(fromIso: string, toIso: string) {
  const from = new Date(fromIso);
  const to = new Date(toIso);

  for (let d = new Date(from); d <= to; d.setUTCDate(d.getUTCDate() + 1)) {
    const dayIso = d.toISOString().slice(0, 10);
    await syncPartnerDay(dayIso);
  }
}
