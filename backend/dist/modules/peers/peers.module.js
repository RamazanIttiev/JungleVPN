"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("../users/users.module");
const peer_entity_1 = require("./peer.entity");
const peers_controller_1 = require("./peers.controller");
const peers_service_1 = require("./peers.service");
const wireguard_service_1 = require("./wireguard.service");
let PeersModule = class PeersModule {
};
exports.PeersModule = PeersModule;
exports.PeersModule = PeersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([peer_entity_1.Peer]), users_module_1.UsersModule],
        providers: [peers_service_1.PeersService, wireguard_service_1.WireGuardService],
        controllers: [peers_controller_1.PeersController],
        exports: [peers_service_1.PeersService],
    })
], PeersModule);
//# sourceMappingURL=peers.module.js.map