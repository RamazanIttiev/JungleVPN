import { User } from '../users/user.entity';
export declare class Peer {
    id: string;
    user: User;
    ipAddress: string;
    publicKey: string;
    privateKey: string;
    createdAt: Date;
    userId: string | undefined;
    token: string | undefined;
}
