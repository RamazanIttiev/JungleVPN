import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Peer } from './peer.entity';
import { WireGuardService } from './wireguard.service';
export declare class PeersService {
    private readonly repo;
    private readonly users;
    private readonly wg;
    constructor(repo: Repository<Peer>, users: UsersService, wg: WireGuardService);
    getPeerByTgId(telegramId: string): Promise<Peer | null>;
    savePeer(peer: Peer): Promise<Peer>;
    issueConfigForTelegram(telegramId: string): Promise<{
        token: string | undefined;
    }>;
    listForTelegram(telegramId: string): Promise<Array<{
        id: string;
        ipAddress: string;
        createdAt: Date;
    }>>;
    removePeer(peerId: string, telegramId: string): Promise<void>;
}
