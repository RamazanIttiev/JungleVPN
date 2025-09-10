import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Peer } from './peer.entity';
import { WireGuardService } from './wireguard.service';

function getNetworkBase(): string {
  const cidr = process.env.WG_NETWORK_CIDR || '10.0.0.0/24';
  return cidr.split('/')[0];
}

function nextIpFromExisting(addresses: string[]): string {
  const base = getNetworkBase().split('.').slice(0, 3).join('.');
  const used = new Set(addresses.map((a) => Number(a.split('.')[3])));
  for (let host = 2; host < 254; host++) {
    if (!used.has(host)) return `${base}.${host}`;
  }
  throw new Error('No free IPs');
}

@Injectable()
export class PeersService {
  constructor(
    @InjectRepository(Peer) private readonly repo: Repository<Peer>,
    private readonly users: UsersService,
    private readonly wg: WireGuardService,
  ) {}

  async getPeerByTgId(telegramId: string): Promise<Peer | null> {
    const user = await this.users.findOrCreateByTelegramId(telegramId);

    return await this.repo.findOne({ where: { userId: user.id } });
  }

  async savePeer(peer: Peer): Promise<Peer> {
    return await this.repo.save(peer);
  }

  async issueConfigForTelegram(telegramId: string): Promise<{ token: string | undefined }> {
    const user = await this.users.findOrCreateByTelegramId(telegramId);

    let peer = await this.repo.findOne({ where: { user: { id: user.id } } });
    if (!peer) {
      const existing = await this.repo.find();
      const existingIps = existing.map((p) => p.ipAddress);
      const ipAddress = nextIpFromExisting(existingIps);
      const { publicKey, privateKey } = await this.wg.generateKeypair();

      peer = this.repo.create({ user, ipAddress, publicKey, privateKey });
      peer.token = randomUUID(); // generate token
      peer = await this.repo.save(peer);

      await this.wg.appendPeerToConfig(publicKey, `${ipAddress}/32`);
      await this.wg.reloadWireGuard();
    } else if (!peer.token) {
      peer.token = randomUUID(); // regenerate if missing
      await this.repo.save(peer);
    }

    return { token: peer.token };
  }

  async listForTelegram(
    telegramId: string,
  ): Promise<Array<{ id: string; ipAddress: string; createdAt: Date }>> {
    const user = await this.users.findOrCreateByTelegramId(telegramId);
    const peers = await this.repo.find({ where: { user: { id: user.id } } });
    // Even though the relation is currently OneToOne, return an array for future-proofing
    return peers.map((p) => ({ id: p.id, ipAddress: p.ipAddress, createdAt: p.createdAt }));
  }

  async removePeer(peerId: string, telegramId: string): Promise<void> {
    const user = await this.users.findOrCreateByTelegramId(telegramId);

    // find peer
    const peer = await this.repo.findOne({
      where: { id: peerId, user: { id: user.id } },
    });
    if (!peer) {
      throw new Error('Peer not found or does not belong to this user');
    }

    // Remove from WireGuard config (unless WG_MOCK)
    await this.wg.removePeerFromConfig(peer.publicKey);
    await this.wg.reloadWireGuard();

    // Remove from DB
    await this.repo.remove(peer);
  }
}
