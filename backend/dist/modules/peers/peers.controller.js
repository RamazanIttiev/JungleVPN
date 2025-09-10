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
exports.PeersController = void 0;
const common_1 = require("@nestjs/common");
const api_key_guard_1 = require("../../shared/auth/api-key.guard");
const peers_service_1 = require("./peers.service");
const wireguard_service_1 = require("./wireguard.service");
let PeersController = class PeersController {
    constructor(peersService, wireGuardService) {
        this.peersService = peersService;
        this.wireGuardService = wireGuardService;
    }
    async issue(telegramId) {
        const { token } = await this.peersService.issueConfigForTelegram(telegramId);
        return { token };
    }
    async remove(peerId, telegramId) {
        await this.peersService.removePeer(peerId, telegramId);
        return { success: true };
    }
    async list(telegramId) {
        const items = await this.peersService.listForTelegram(telegramId);
        return { items };
    }
    async config(telegramId) {
        const peer = await this.peersService.getPeerByTgId(telegramId);
        if (!peer) {
            console.log('NO PEER');
            return;
        }
        const filename = `vpn-${peer.user.telegramId}.conf`;
        const content = this.wireGuardService.buildWireGuardClientConfig(peer);
        return {
            filename,
            content,
        };
    }
};
exports.PeersController = PeersController;
__decorate([
    (0, common_1.Get)('issue'),
    (0, common_1.Header)('Content-Type', 'application/json'),
    __param(0, (0, common_1.Query)('telegramId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeersController.prototype, "issue", null);
__decorate([
    (0, common_1.Delete)(':peerId'),
    __param(0, (0, common_1.Param)('peerId')),
    __param(1, (0, common_1.Query)('telegramId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PeersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('list'),
    (0, common_1.Header)('Content-Type', 'application/json'),
    __param(0, (0, common_1.Query)('telegramId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, common_1.Header)('Content-Type', 'application/json'),
    __param(0, (0, common_1.Query)('telegramId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PeersController.prototype, "config", null);
exports.PeersController = PeersController = __decorate([
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard),
    (0, common_1.Controller)('peers'),
    __metadata("design:paramtypes", [peers_service_1.PeersService,
        wireguard_service_1.WireGuardService])
], PeersController);
//# sourceMappingURL=peers.controller.js.map