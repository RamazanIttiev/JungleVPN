import * as process from 'node:process';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateWgKeypair, nextIpFromExisting } from '../../shared/utils/generators';
import { UsersService } from '../users/users.service';
import { Peer } from './peer.entity';
import { WireGuardService } from './wireguard.service';

@Injectable()
export class PeersService {
  constructor(
    @InjectRepository(Peer) private readonly repo: Repository<Peer>,
    private readonly users: UsersService,
    private readonly wg: WireGuardService,
  ) {}

  private readonly mock = (process.env.WG_MOCK || 'true') === 'true';

  async getAll(telegramId: string): Promise<Peer[]> {
    const user = await this.users.get(telegramId);

    const peers = await this.repo.find({ where: { user: { id: user.id } } });

    if (!peers) throw new UnauthorizedException('NO PEER FOUND. method: getPeerByTgId');

    return peers;
  }

  async getByTelegramId(telegramId: string): Promise<Peer> {
    const user = await this.users.get(telegramId);

    const peer = await this.repo.findOne({
      where: { user: { id: user.id } },
    });

    if (!peer) throw new UnauthorizedException('NO PEER FOUND. method: getByTelegramId');

    return peer;
  }

  async get(id: string): Promise<Peer> {
    const peer = await this.repo.findOne({
      where: { id },
    });

    if (!peer) throw new UnauthorizedException('NO PEER FOUND. method: get');

    return peer;
  }

  private async generateKeypair() {
    if (this.mock) {
      return generateWgKeypair();
    } else {
      return await this.wg.generateKeypair();
    }
  }

  async add(telegramId: string): Promise<Peer> {
    const user = await this.users.get(telegramId);

    const peers = await this.repo.find();
    const existingIps = peers.map((p) => p.ipAddress);
    const ipAddress = nextIpFromExisting(existingIps);

    const { publicKey, privateKey } = await this.generateKeypair();

    try {
      const peer = this.repo.create({
        user,
        ipAddress,
        publicKey,
        privateKey,
      });

      await this.repo.save(peer);

      if (!this.mock) {
        await this.wg.appendPeerToConfig(publicKey, `${ipAddress}/32`);
        await this.wg.reloadWireGuard();
      }

      return peer;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMappedPeers(telegramId: string): Promise<Array<{ id: string; createdAt: Date }>> {
    const peers = await this.getAll(telegramId);
    // Even though the relation is currently OneToOne, return an array for future-proofing
    return peers.map((p) => ({ id: p.id, createdAt: p.createdAt }));
  }

  async remove(peerId: string): Promise<{ success: boolean }> {
    const peer = await this.get(peerId);

    try {
      if (!this.mock) {
        await this.wg.removePeerFromConfig(peer.publicKey);
        await this.wg.reloadWireGuard();
      }
      await this.repo.remove(peer);

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async removeAll(telegramId: string): Promise<{ success: boolean }> {
    const peer = await this.getAll(telegramId);

    try {
      if (!this.mock) {
        // await this.wg.removePeerFromConfig(peer.publicKey);
        // await this.wg.reloadWireGuard();
      }
      await this.repo.remove(peer);

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}
