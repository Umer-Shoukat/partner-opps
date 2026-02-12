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
exports.AppsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const apps_service_1 = require("./apps.service");
const update_app_dto_1 = require("./dto/update-app.dto");
let AppsController = class AppsController {
    apps;
    constructor(apps) {
        this.apps = apps;
    }
    async list() {
        return this.apps.list();
    }
    async create(body) {
        return this.apps.create(body);
    }
    async createKey(id) {
        return this.apps.createIngestionKey(id);
    }
    async revokeKey(keyId) {
        return this.apps.revokeKey(keyId);
    }
    async update(id, body) {
        return this.apps.update(id, body);
    }
};
exports.AppsController = AppsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/keys"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "createKey", null);
__decorate([
    (0, common_1.Delete)("keys/:keyId"),
    __param(0, (0, common_1.Param)("keyId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "revokeKey", null);
__decorate([
    (0, common_1.Patch)("/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_app_dto_1.UpdateAppDto]),
    __metadata("design:returntype", Promise)
], AppsController.prototype, "update", null);
exports.AppsController = AppsController = __decorate([
    (0, common_1.Controller)("apps"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    __metadata("design:paramtypes", [apps_service_1.AppsService])
], AppsController);
//# sourceMappingURL=apps.controller.js.map