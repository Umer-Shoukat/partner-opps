import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import pino from "pino";
import { backfillPartner, syncPartnerDay } from "./partner/partner.sync";
import "dotenv/config";
import { startPartnerWorker } from "./processors/partner.processor";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });

const partnerQueue = new Queue("partner_sync", { connection });
const rollupQueue = new Queue("rollups_daily", { connection });

if (!redisUrl) throw new Error("Missing REDIS_URL");
startPartnerWorker(redisUrl);
console.log("Worker started");

function dateOnlyUTC(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

async function ensureSeedApps() {
  const count = await prisma.app.count();
  if (count === 0) {
    logger.warn("No apps found. Seed apps via API /apps or insert directly.");
  }
}

// --- Processors ---
new Worker(
  "partner_sync",
  async (job) => {
    const day = dateOnlyUTC(new Date(job.data.day));
    const apps = await prisma.app.findMany();
    for (const app of apps) {
      await prisma.partnerDailyMetric.upsert({
        where: { day_appId_currency: { day, appId: app.id, currency: "USD" } },
        create: {
          day,
          appId: app.id,
          currency: "USD",
          raw: { note: "TODO: partner api query" },
        },
        update: { fetchedAt: new Date() },
      });
    }
    return { apps: apps.length };
  },
  { connection },
);

new Worker(
  "rollups_daily",
  async (job) => {
    const day = dateOnlyUTC(new Date(job.data.day));
    const dayStart = day;
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const apps = await prisma.app.findMany();
    for (const app of apps) {
      const installs = await prisma.event.count({
        where: {
          appId: app.id,
          eventType: "app.install.created",
          eventTs: { gte: dayStart, lt: dayEnd },
        },
      });
      const uninstalls = await prisma.event.count({
        where: {
          appId: app.id,
          eventType: "app.install.deleted",
          eventTs: { gte: dayStart, lt: dayEnd },
        },
      });

      const activeInstallsEndOfDay = await prisma.merchantApp.count({
        where: {
          appId: app.id,
          status: "installed",
          installedAt: { lt: dayEnd },
        },
      });

      await prisma.dailyInstallRollup.upsert({
        where: { day_appId: { day, appId: app.id } },
        create: {
          day,
          appId: app.id,
          installs,
          uninstalls,
          activeInstallsEndOfDay,
        },
        update: { installs, uninstalls, activeInstallsEndOfDay },
      });

      // MRR rollup (as-of plan price, normalized to monthly)
      const subs = await prisma.subscription.findMany({
        where: {
          appId: app.id,
          status: "active",
          OR: [{ activatedAt: null }, { activatedAt: { lt: dayEnd } }],
          AND: [
            {
              OR: [{ cancelledAt: null }, { cancelledAt: { gte: dayEnd } }],
            },
          ],
        },
      });

      const byCurrency = new Map<string, { mrr: number; active: number }>();
      for (const s of subs) {
        const currency = s.currency;
        const price = Number(s.price);
        let mrr = 0;
        const interval = (s.interval || "").toUpperCase();
        if (interval.includes("ANNUAL")) mrr = price / 12;
        else if (interval.includes("WEEK")) mrr = (price * 52) / 12;
        else mrr = price; // monthly default

        const cur = byCurrency.get(currency) || { mrr: 0, active: 0 };
        cur.mrr += mrr;
        cur.active += 1;
        byCurrency.set(currency, cur);
      }

      for (const [currency, agg] of byCurrency.entries()) {
        await prisma.dailyMrrRollup.upsert({
          where: { day_appId_currency: { day, appId: app.id, currency } },
          create: {
            day,
            appId: app.id,
            currency,
            mrr: agg.mrr,
            arr: agg.mrr * 12,
            activePayingMerchants: agg.active,
            newMrr: 0,
            expansionMrr: 0,
            contractionMrr: 0,
            churnedMrr: 0,
          },
          update: {
            mrr: agg.mrr,
            arr: agg.mrr * 12,
            activePayingMerchants: agg.active,
          },
        });
      }
    }

    return { apps: apps.length };
  },
  { connection },
);

const mode = process.env.PARTNER_SYNC_MODE || "yesterday"; // yesterday | backfill
const backfillFrom = process.env.PARTNER_BACKFILL_FROM; // YYYY-MM-DD
const backfillTo = process.env.PARTNER_BACKFILL_TO; // YYYY-MM-DD

(async () => {
  if (process.env.PARTNER_SYNC_ENABLED !== "true") return;

  if (mode === "backfill") {
    if (!backfillFrom || !backfillTo) {
      throw new Error(
        "Set PARTNER_BACKFILL_FROM and PARTNER_BACKFILL_TO for backfill mode",
      );
    }
    await backfillPartner(backfillFrom, backfillTo);
  } else {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    const dayIso = d.toISOString().slice(0, 10);
    await syncPartnerDay(dayIso);
  }
})();

// --- Schedulers ---
async function scheduleOncePerHour() {
  const day = dateOnlyUTC(new Date());

  await partnerQueue.add("daily", { day }, { jobId: `partner-daily-${day}` });
  // await rollupQueue.add(
  //   "daily",
  //   { day: day.toISOString() },
  //   { jobId: `rollup:${day.toISOString()}` },
  // );
  await rollupQueue.add("daily", { day }, { jobId: `rollups-daily-${day}` });
}

async function main() {
  await ensureSeedApps();
  await scheduleOncePerHour();

  // repeat hourly (MVP). In prod: use cron/temporal/k8s CronJob with daily schedule.
  setInterval(scheduleOncePerHour, 60 * 60 * 1000);

  logger.info("Worker started.......");
}

main().catch((e) => {
  logger.error(e);
  process.exit(1);
});
