import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
export type PaymentProvider = 'yookassa';
export type PaymentStatus = 'pending' | 'succeeded';

@Entity('payments')
export class Payment {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: number;

  @Column()
  provider: PaymentProvider;

  @Column()
  amount: string;

  @Column()
  currency: string;

  @Column({ default: 'pending' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  paidAt: Date;
}

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
