import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ReferralStatus {
  PENDING = 'PENDING',
  FIRST_REWARD = 'FIRST_REWARD',
  COMPLETED = 'COMPLETED',
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  inviterId: number;

  @Column({ type: 'bigint', unique: true })
  invitedId: number;

  @Column({
    type: 'enum',
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

  @CreateDateColumn()
  createdAt: Date;
}
