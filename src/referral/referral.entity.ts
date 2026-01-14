import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ReferralStatus = 'PENDING' | 'FIRST_REWARD' | 'COMPLETED';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  inviterId: number;

  @Column({ type: 'bigint', unique: true })
  invitedId: number;

  @Column({
    type: 'varchar',
    default: 'PENDING',
  })
  status: ReferralStatus;

  @CreateDateColumn()
  createdAt: Date;
}
