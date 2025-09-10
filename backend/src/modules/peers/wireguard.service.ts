import { exec as execCb } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { promisify } from 'node:util';
import { Injectable } from '@nestjs/common';
import { Peer } from './peer.entity';

type ClientConfigInput = {
  clientPrivateKey: string;
  clientIpAddress: string; // IPv4, e.g. 10.0.0.2
  serverPublicKey: string;
  serverPublicIp: string; // public IPv4 or hostname
  dns: string; // comma-separated list of DNS resolvers
  allowedIps: string; // AllowedIPs for the peer section
};

export function generateWgKeypair() {
  const { publicKey, privateKey } = generateKeyPairSync('x25519');

  // Get raw 32-byte keys via JWK, then encode as base64 (WireGuard style)
  const pubJwk = publicKey.export({ format: 'jwk' }) as { x: string };
  const privJwk = privateKey.export({ format: 'jwk' }) as { d: string };

  const publicKeyB64 = Buffer.from(pubJwk.x, 'base64url').toString('base64');
  const privateKeyB64 = Buffer.from(privJwk.d, 'base64url').toString('base64');

  return { publicKey: publicKeyB64, privateKey: privateKeyB64 };
}

const exec = promisify(execCb);

@Injectable()
export class WireGuardService {
  private readonly interfaceName = process.env.WG_INTERFACE || 'wg0';
  private readonly mock = (process.env.WG_MOCK || 'true') === 'true';

  async generateKeypair(): Promise<{ publicKey: string; privateKey: string }> {
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

  async appendPeerToConfig(publicKey: string, allowedIpCidr: string): Promise<void> {
    if (this.mock) return;
    const peerBlock = `\n[Peer]\nPublicKey = ${publicKey}\nAllowedIPs = ${allowedIpCidr}\nPersistentKeepalive = 25`;
    // Append peer block into the server config on the host filesystem (no sudo/systemctl)
    await exec(`sh -lc 'printf "%s" "${peerBlock}" >> /etc/wireguard/${this.interfaceName}.conf'`);
  }

  async removePeerFromConfig(publicKey: string): Promise<void> {
    if (this.mock) return;
    const ifc = this.interfaceName;

    // Use wg syncconf: create a stripped config without this peer
    const tmpFile = `/tmp/${ifc}.stripped`;
    const confFile = `/etc/wireguard/${ifc}.conf`;

    // Remove peer block matching PublicKey
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

  async reloadWireGuard(): Promise<void> {
    if (this.mock) return;
    // Reload configuration using wg-quick strip + wg syncconf (no systemctl)
    const ifc = this.interfaceName;
    const stripCmd = `wg-quick strip /etc/wireguard/${ifc}.conf > /tmp/${ifc}.stripped`;
    const syncCmd = `wg syncconf ${ifc} /tmp/${ifc}.stripped`;
    await exec(`sh -lc '${stripCmd} && ${syncCmd}'`);
  }

  /**
   * Builds a WireGuard client configuration using environment-provided server values
   * and a generated client keypair. Pure function for easy local testing.
   *
   * Fields mapping:
   * - [Interface].PrivateKey: generated per-device client private key
   * - [Interface].Address: assigned /32 IP from WG_NETWORK_CIDR
   * - [Interface].DNS: WG_DNS env value
   * - [Peer].PublicKey: server public key from WG_SERVER_PUBLIC_KEY
   * - [Peer].Endpoint: server IP/host and UDP 51820 from WG_SERVER_PUBLIC_IP
   * - [Peer].AllowedIPs: WG_ALLOWED_IPS (usually 0.0.0.0/0, ::/0)
   * - [Peer].PersistentKeepalive: set to 25s for NAT traversal on mobile networks
   */
  buildWireGuardClientConfig(peer: Peer): string {
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
}
