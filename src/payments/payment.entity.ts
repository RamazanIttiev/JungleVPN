import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { PaymentCurrency, PaymentProvider, PaymentStatus } from './payments.model';

@Entity('payments')
export class Payment {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true, type: 'varchar' })
  userId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  stripeCustomerId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  stripeSubscriptionId: string | null;

  @Column({ type: 'varchar' })
  provider: PaymentProvider;

  @Column({ type: 'int', nullable: true })
  amount: number | null;

  @Column({ type: 'varchar', nullable: true })
  currency: PaymentCurrency | null;

  @Column({ type: 'varchar', default: 'pending' })
  status: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  url: string | null;

  @Column({ type: 'varchar', nullable: true })
  invoiceUrl: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;
}
