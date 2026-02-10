"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("@nestjs/bullmq");
const auth_module_1 = require("./modules/auth/auth.module");
const apps_module_1 = require("./modules/apps/apps.module");
const events_module_1 = require("./modules/events/events.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const partner_module_1 = require("./modules/partner/partner.module");
const redis_provider_1 = require("./common/redis/redis.provider");
const redis_module_1 = require("./common/redis/redis.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            bullmq_1.BullModule.forRoot({
                connection: { url: process.env.REDIS_URL || "redis://localhost:6379" },
            }),
            auth_module_1.AuthModule,
            apps_module_1.AppsModule,
            events_module_1.EventsModule,
            analytics_module_1.AnalyticsModule,
            partner_module_1.PartnerModule,
            redis_module_1.RedisModule,
        ],
        providers: [redis_provider_1.RedisProvider],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map