@Processor("partner_sync")
export class PartnerSyncProcessor {
  constructor(
    private partner: PartnerService,
    private prisma: PrismaService,
  ) {}

  @Process("daily")
  async handle(job: Job<{ day: string }>) {
    const day = job.data.day;
    const apps = await this.partner.fetchDailyMetrics(day);

    for (const app of apps) {
      const hubApp = await this.prisma.app.findFirst({
        where: { name: app.name },
      });
      if (!hubApp) continue;

      await this.prisma.partnerDailyMetric.upsert({
        where: {
          day_appId_currency: {
            day: new Date(day),
            appId: hubApp.id,
            currency: app.events.grossRevenue.currencyCode,
          },
        },
        create: {
          day: new Date(day),
          appId: hubApp.id,
          currency: app.events.grossRevenue.currencyCode,
          installs: app.events.installs,
          uninstalls: app.events.uninstalls,
          activeInstalls: app.events.activeInstalls,
          revenueGross: app.events.grossRevenue.amount,
          revenueNet: app.events.netRevenue.amount,
          raw: app,
        },
        update: {
          installs: app.events.installs,
          uninstalls: app.events.uninstalls,
          activeInstalls: app.events.activeInstalls,
          revenueGross: app.events.grossRevenue.amount,
          revenueNet: app.events.netRevenue.amount,
          fetchedAt: new Date(),
        },
      });
    }
  }
}
