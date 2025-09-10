"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WireGuardService = void 0;
exports.generateWgKeypair = generateWgKeypair;
const node_child_process_1 = require("node:child_process");
const node_crypto_1 = require("node:crypto");
const node_util_1 = require("node:util");
const common_1 = require("@nestjs/common");
function generateWgKeypair() {
    const { publicKey, privateKey } = (0, node_crypto_1.generateKeyPairSync)('x25519');
    const pubJwk = publicKey.export({ format: 'jwk' });
    const privJwk = privateKey.export({ format: 'jwk' });
    const publicKeyB64 = Buffer.from(pubJwk.x, 'base64url').toString('base64');
    const privateKeyB64 = Buffer.from(privJwk.d, 'base64url').toString('base64');
    return { publicKey: publicKeyB64, privateKey: privateKeyB64 };
}
const exec = (0, node_util_1.promisify)(node_child_process_1.exec);
let WireGuardService = class WireGuardService {
    constructor() {
        this.interfaceName = process.env.WG_INTERFACE || 'wg0';
        this.mock = (process.env.WG_MOCK || 'true') === 'true';
    }
    async generateKeypair() {
        if (this.mock) {
            const { publicKey, privateKey } = generateWgKeypair();
            return { publicKey, privateKey };
        }
        const { stdout: priv } = await exec('wg genkey');
        const privateKey = priv.trim();
        const { stdout: pub } = await exec(`echo ${privateKey} | wg pubkey`);
        const publicKey = pub.trim();
        return { publicKey, privateKey };
    }
    async appendPeerToConfig(publicKey, allowedIpCidr) {
        if (this.mock)
            return;
        const peerBlock = `\n[Peer]\nPublicKey = ${publicKey}\nAllowedIPs = ${allowedIpCidr}\nPersistentKeepalive = 25`;
        await exec(`sh -lc 'printf "%s" "${peerBlock}" >> /etc/wireguard/${this.interfaceName}.conf'`);
    }
    async removePeerFromConfig(publicKey) {
        if (this.mock)
            return;
        const ifc = this.interfaceName;
        const tmpFile = `/tmp/${ifc}.stripped`;
        const confFile = `/etc/wireguard/${ifc}.conf`;
        const cmd = `
      awk 'BEGIN {skip=0} 
        /^$begin:math:display$Peer$end:math:display$/ {buf=$0; skip=0; next} 
        /^PublicKey[ ]*=[ ]*${publicKey}$/ {skip=1; next} 
        skip && NF==0 {skip=0; next} 
        !skip {print buf; print; buf=""}
      ' ${confFile} > ${tmpFile} && mv ${tmpFile} ${confFile}
    `;
        await exec(`sh -lc '${cmd}'`);
    }
    async reloadWireGuard() {
        if (this.mock)
            return;
        const ifc = this.interfaceName;
        const stripCmd = `wg-quick strip /etc/wireguard/${ifc}.conf > /tmp/${ifc}.stripped`;
        const syncCmd = `wg syncconf ${ifc} /tmp/${ifc}.stripped`;
        await exec(`sh -lc '${stripCmd} && ${syncCmd}'`);
    }
    buildWireGuardClientConfig(peer) {
        const lines = [
            '[Interface]',
            `PrivateKey = ${peer.privateKey}`,
            `Address = ${peer.ipAddress}/32`,
            `DNS = ${process.env.WG_DNS}`,
            '',
            '[Peer]',
            `PublicKey = ${process.env.WG_SERVER_PUBLIC_KEY}`,
            `Endpoint = ${process.env.WG_SERVER_PUBLIC_IP}:51820`,
            `AllowedIPs = ${process.env.WG_ALLOWED_IPS}`,
            'PersistentKeepalive = 25',
        ];
        return lines.join('\n');
    }
};
exports.WireGuardService = WireGuardService;
exports.WireGuardService = WireGuardService = __decorate([
    (0, common_1.Injectable)()
], WireGuardService);
//# sourceMappingURL=wireguard.service.js.map