import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "../users/users.service";
import { Payment } from "./payment.entity";

@Injectable()
export class PaymentsService {
	constructor(
    @InjectRepository(Payment) private readonly repo: Repository<Payment>,
    private readonly users: UsersService,
  ) {}

	async mockCreatePaid(telegramId: string, amount: number): Promise<Payment> {
		const user = await this.users.findOrCreateByTelegramId(telegramId);
		const payment = this.repo.create({ user, amount, status: "paid" });
		await this.repo.save(payment);
		await this.users.setActive(user.id, true);
		return payment;
	}
}
