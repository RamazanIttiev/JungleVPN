import { PeersService } from './peers.service';
import { WireGuardService } from './wireguard.service';
export declare class PeersController {
    private readonly peersService;
    private readonly wireGuardService;
    constructor(peersService: PeersService, wireGuardService: WireGuardService);
    issue(telegramId: string): Promise<{
        token: string | undefined;
    }>;
    remove(peerId: string, telegramId: string): Promise<{
        success: boolean;
    }>;
    list(telegramId: string): Promise<{
        items: {
            id: string;
            ipAddress: string;
            createdAt: Date;
        }[];
    }>;
    config(telegramId: string): Promise<{
        filename: string;
        content: string;
    } | undefined>;
}
