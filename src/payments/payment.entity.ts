import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { PaymentProvider, PaymentStatus } from './payments.model';

@Entity('payments')
export class Payment {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ type: 'varchar' })
  provider: PaymentProvider;

  @Column({ nullable: true })
  amount: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ default: 'pending', type: 'varchar' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  url: string;
}
