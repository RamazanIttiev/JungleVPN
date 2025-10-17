import { PaymentAmount, PaymentProvider, PaymentStatus } from '@payments/payments.model';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column()
  provider: PaymentProvider;

  @Column()
  providerPaymentId: string;

  @Column()
  amount: string;

  @Column()
  currency: string;

  @Column({ default: 'pending' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
}

export interface YooKassaPaymentInvoice {
  value: PaymentAmount;
}

// @Entity('Invoice')
// export class Invoice {
//   @Column() chatId: number;
//   @Column() title: string;
//   @Column() description: string;
//   @Column() payload: string;
//   @Column() provider_token: string;
//   @Column({ length: 3, default: 'RUB' }) currency: string;
//   @Column() prices: string;
//   @Column() need_email: boolean;
//   @CreateDateColumn() createdAt: Date;
// }
