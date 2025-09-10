import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { Payment } from "./payment.entity";
export declare class PaymentsService {
    private readonly repo;
    private readonly users;
    constructor(repo: Repository<Payment>, users: UsersService);
    mockCreatePaid(telegramId: string, amount: number): Promise<Payment>;
}
