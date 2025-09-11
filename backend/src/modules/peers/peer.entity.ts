import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type PeerStatus = 'provisioning' | 'active' | 'disabled' | 'revoked';

@Entity('peers')
export class Peer {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(
    () => User,
    (u) => u.peers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true }) ipAddress: string;

  @Column({ unique: true }) publicKey: string;

  @Column({ type: 'text', select: false, nullable: true }) privateKeyEnc: string; // encrypted, not returned by default

  @CreateDateColumn() createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['provisioning', 'active', 'disabled', 'revoked'],
    default: 'provisioning',
  })
  status: PeerStatus;

  @Column({ nullable: true }) name?: string;

  @Column({ nullable: true }) expiresAt?: Date;
  @Column({ nullable: true }) revokedAt?: Date;
}
