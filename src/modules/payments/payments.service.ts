import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private readonly repo: Repository<Payment>) {}

  async mockCreatePaid(telegramId: string, amount: number): Promise<Payment> {
    const payment = this.repo.create({ amount, currency: 'RUB', status: 'paid' });
    await this.repo.save(payment);
    return payment;
  }
}
