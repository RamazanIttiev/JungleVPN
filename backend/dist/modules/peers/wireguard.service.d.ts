import { Peer } from './peer.entity';
export declare function generateWgKeypair(): {
    publicKey: string;
    privateKey: string;
};
export declare class WireGuardService {
    private readonly interfaceName;
    private readonly mock;
    generateKeypair(): Promise<{
        publicKey: string;
        privateKey: string;
    }>;
    appendPeerToConfig(publicKey: string, allowedIpCidr: string): Promise<void>;
    removePeerFromConfig(publicKey: string): Promise<void>;
    reloadWireGuard(): Promise<void>;
    buildWireGuardClientConfig(peer: Peer): string;
}
