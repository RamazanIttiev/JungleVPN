import { Payment } from "../payments/payment.entity";
import { Peer } from "../peers/peer.entity";
export declare class User {
    id: string;
    telegramId: string;
    createdAt: Date;
    expiresAt: Date | null;
    active: boolean;
    payments: Payment[];
    peer: Peer;
}
