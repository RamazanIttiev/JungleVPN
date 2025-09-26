import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(
    () => User,
    (u) => u.payments,
    { onDelete: 'SET NULL' },
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column() userId: string;

  @Column({ type: 'integer' }) amount: number; // store cents

  @Column({ length: 3, default: 'RUB' }) currency: string; // ISO code, e.g. "EUR"

  @Column({ nullable: true }) provider?: string;
  @Column({ nullable: true }) providerPaymentId?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    nullable: true,
  })
  status: PaymentStatus;

  @CreateDateColumn() createdAt: Date;
  @Column({ nullable: true }) confirmedAt?: Date;
}
