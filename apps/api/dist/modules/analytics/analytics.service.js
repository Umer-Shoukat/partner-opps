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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
function toDateOnly(d) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async portfolioSummary(asOf) {
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
        const activeInstalls = install.reduce((a, r) => a + r.activeInstallsEndOfDay, 0);
        const byCurrency = {};
        for (const r of mrr) {
            if (!byCurrency[r.currency])
                byCurrency[r.currency] = { mrr: 0, arr: 0 };
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
    async partnerReconcile(from, to, appId) {
        const dayFilter = { gte: toDateOnly(from), lte: toDateOnly(to) };
        const partnerWhere = { day: dayFilter };
        if (appId)
            partnerWhere.appId = appId;
        const hubWhere = { day: dayFilter };
        if (appId)
            hubWhere.appId = appId;
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
    async partnerSummary(fromIso, toIso) {
        const from = new Date(fromIso);
        const to = new Date(toIso);
        const rows = await this.prisma.partnerDailyMetric.findMany({
            where: { day: { gte: from, lte: to } },
            include: { app: true },
            orderBy: [{ day: "asc" }],
        });
        const byDay = {};
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map