import { User } from "../users/user.entity";
export type PaymentStatus = "pending" | "paid" | "failed";
export declare class Payment {
    id: string;
    user: User;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
}
