import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/db/prisma.service";

function toDateOnly(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async portfolioSummary(asOf: Date) {
    const day = toDateOnly(asOf);

    const [apps, install, mrr] = await Promise.all([
      this.prisma.app.findMany({
        select: { id: true, slug: true, name: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.dailyInstallRollup.findMany({ where: { day } }),
      this.prisma.dailyMrrRollup.findMany({ where: { day } }),
    ]);

    const installs = install.reduce((a, r) => a + r.installs, 0);
    const uninstalls = install.reduce((a, r) => a + r.uninstalls, 0);
    const activeInstalls = install.reduce(
      (a, r) => a + r.activeInstallsEndOfDay,
      0,
    );

    const byCurrency: Record<string, { mrr: number; arr: number }> = {};
    for (const r of mrr) {
      if (!byCurrency[r.currency]) byCurrency[r.currency] = { mrr: 0, arr: 0 };
      byCurrency[r.currency].mrr += Number(r.mrr);
      byCurrency[r.currency].arr += Number(r.arr);
    }

    const mrrByCurrency = Object.entries(byCurrency).map(([currency, v]) => ({
      currency,
      mrr: v.mrr.toFixed(2),
      arr: v.arr.toFixed(2),
    }));

    return {
      asOfDay: day.toISOString().slice(0, 10),
      apps,
      installs,
      uninstalls,
      activeInstalls,
      mrrByCurrency,
    };
  }

  async partnerReconcile(from: Date, to: Date, appId?: string) {
    const dayFilter = { gte: toDateOnly(from), lte: toDateOnly(to) };

    const partnerWhere: any = { day: dayFilter };
    if (appId) partnerWhere.appId = appId;

    const hubWhere: any = { day: dayFilter };
    if (appId) hubWhere.appId = appId;

    const [partner, hubInstall] = await Promise.all([
      this.prisma.partnerDailyMetric.findMany({
        where: partnerWhere,
        orderBy: { day: "asc" },
      }),
      this.prisma.dailyInstallRollup.findMany({
        where: hubWhere,
        orderBy: { day: "asc" },
      }),
    ]);

    return { partner, hubInstall };
  }

  async partnerSummary(fromIso: string, toIso: string) {
    const from = new Date(fromIso);
    const to = new Date(toIso);

    const rows = await this.prisma.partnerDailyMetric.findMany({
      where: { day: { gte: from, lte: to } },
      include: { app: true },
      orderBy: [{ day: "asc" }],
    });

    // total across apps per day (for dashboard charts)
    const byDay: Record<string, any> = {};

    for (const r of rows) {
      const day = r.day.toISOString().slice(0, 10);
      byDay[day] ??= {
        day,
        installs: 0,
        uninstalls: 0,
        activeInstalls: 0,
        revenueGross: 0,
        revenueNet: 0,
        currency: r.currency,
      };
      byDay[day].installs += r.installs ?? 0;
      byDay[day].uninstalls += r.uninstalls ?? 0;
      byDay[day].activeInstalls += r.activeInstalls ?? 0;
      byDay[day].revenueGross += Number(r.revenueGross ?? 0);
      byDay[day].revenueNet += Number(r.revenueNet ?? 0);
    }

    return {
      range: { from: fromIso, to: toIso },
      series: Object.values(byDay),
      byApp: rows.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
        appId: r.appId,
        appName: r.app.name,
        installs: r.installs,
        uninstalls: r.uninstalls,
        activeInstalls: r.activeInstalls,
        revenueGross: r.revenueGross,
        revenueNet: r.revenueNet,
        currency: r.currency,
      })),
    };
  }
}
