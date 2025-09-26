import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { nextIpFromExisting } from '../../shared/utils/generators';
import { UsersService } from '../users/users.service';
import { Peer } from './peer.entity';

@Injectable()
export class PeersService {
  constructor(
    @InjectRepository(Peer) private readonly repo: Repository<Peer>,
    private readonly users: UsersService,
  ) {}

  // WireGuard removed; peers are tracked in DB only for VLESS clients

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

    if (!peer) throw new UnauthorizedException('NO PEER FOUND. method: getByTelegramId').message;

    return peer;
  }

  async get(id: string): Promise<Peer> {
    const peer = await this.repo.findOne({
      where: { id },
    });

    if (!peer) throw new UnauthorizedException('NO PEER FOUND. method: get');

    return peer;
  }

  // No keypair generation required for VLESS

  async add(telegramId: string): Promise<Peer> {
    const user = await this.users.get(telegramId);

    const peers = await this.repo.find();
    const existingIps = peers.map((p) => p.ipAddress);
    const ipAddress = nextIpFromExisting(existingIps);

    try {
      const peer = this.repo.create({
        user,
        ipAddress,
      });

      await this.repo.save(peer);

      return peer;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(peerId: string): Promise<{ success: boolean }> {
    const peer = await this.get(peerId);

    try {
      await this.repo.remove(peer);

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  async getMappedPeers(telegramId: string): Promise<Array<{ id: string; createdAt: Date }>> {
    const peers = await this.getAll(telegramId);
    // Even though the relation is currently OneToOne, return an array for future-proofing
    return peers.map((p) => ({ id: p.id, createdAt: p.createdAt }));
  }

  async removeAll(): Promise<{ success: boolean }> {
    try {
      await this.repo.clear();

      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}
