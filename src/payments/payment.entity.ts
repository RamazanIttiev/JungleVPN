import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { PaymentProvider, PaymentStatus } from './payments.model';

@Entity('payments')
export class Payment {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'varchar' })
  provider: PaymentProvider;

  @Column({ nullable: true })
  amount: number;

  @Column()
  currency: string;

  @Column({ default: 'pending', type: 'varchar' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  paidAt: Date;

  @Column({ nullable: true })
  url: string;
}
