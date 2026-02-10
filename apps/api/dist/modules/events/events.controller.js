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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const ingestion_hmac_guard_1 = require("../../common/auth/ingestion-hmac.guard");
const shared_1 = require("@appops/shared");
const events_service_1 = require("./events.service");
let EventsController = class EventsController {
    events;
    constructor(events) {
        this.events = events;
    }
    async ingest(body, req) {
        const parsed = shared_1.EventsBatch.parse(body);
        const appId = req.ingestion?.appId;
        return this.events.ingestBatch(appId, parsed.events);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)("/events"),
    (0, common_1.UseGuards)(ingestion_hmac_guard_1.IngestionHmacGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "ingest", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map