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
exports.PeersService = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const peer_entity_1 = require("./peer.entity");
const wireguard_service_1 = require("./wireguard.service");
function getNetworkBase() {
    const cidr = process.env.WG_NETWORK_CIDR || '10.0.0.0/24';
    return cidr.split('/')[0];
}
function nextIpFromExisting(addresses) {
    const base = getNetworkBase().split('.').slice(0, 3).join('.');
    const used = new Set(addresses.map((a) => Number(a.split('.')[3])));
    for (let host = 2; host < 254; host++) {
        if (!used.has(host))
            return `${base}.${host}`;
    }
    throw new Error('No free IPs');
}
let PeersService = class PeersService {
    constructor(repo, users, wg) {
        this.repo = repo;
        this.users = users;
        this.wg = wg;
    }
    async getPeerByTgId(telegramId) {
        const user = await this.users.findOrCreateByTelegramId(telegramId);
        return await this.repo.findOne({ where: { userId: user.id } });
    }
    async savePeer(peer) {
        return await this.repo.save(peer);
    }
    async issueConfigForTelegram(telegramId) {
        const user = await this.users.findOrCreateByTelegramId(telegramId);
        let peer = await this.repo.findOne({ where: { user: { id: user.id } } });
        if (!peer) {
            const existing = await this.repo.find();
            const existingIps = existing.map((p) => p.ipAddress);
            const ipAddress = nextIpFromExisting(existingIps);
            const { publicKey, privateKey } = await this.wg.generateKeypair();
            peer = this.repo.create({ user, ipAddress, publicKey, privateKey });
            peer.token = (0, node_crypto_1.randomUUID)();
            peer = await this.repo.save(peer);
            await this.wg.appendPeerToConfig(publicKey, `${ipAddress}/32`);
            await this.wg.reloadWireGuard();
        }
        else if (!peer.token) {
            peer.token = (0, node_crypto_1.randomUUID)();
            await this.repo.save(peer);
        }
        return { token: peer.token };
    }
    async listForTelegram(telegramId) {
        const user = await this.users.findOrCreateByTelegramId(telegramId);
        const peers = await this.repo.find({ where: { user: { id: user.id } } });
        return peers.map((p) => ({ id: p.id, ipAddress: p.ipAddress, createdAt: p.createdAt }));
    }
    async removePeer(peerId, telegramId) {
        const user = await this.users.findOrCreateByTelegramId(telegramId);
        const peer = await this.repo.findOne({
            where: { id: peerId, user: { id: user.id } },
        });
        if (!peer) {
            throw new Error('Peer not found or does not belong to this user');
        }
        await this.wg.removePeerFromConfig(peer.publicKey);
        await this.wg.reloadWireGuard();
        await this.repo.remove(peer);
    }
};
exports.PeersService = PeersService;
exports.PeersService = PeersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(peer_entity_1.Peer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        wireguard_service_1.WireGuardService])
], PeersService);
//# sourceMappingURL=peers.service.js.map