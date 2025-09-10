import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('peers')
export class Peer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(
    () => User,
    (u) => u.peer,
    { eager: true },
  )
  @JoinColumn()
  user!: User;

  @Column({ unique: true })
  ipAddress!: string; // 10.0.0.x

  @Column()
  publicKey!: string;

  @Column()
  privateKey!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  userId: string | undefined;

  @Column({ type: 'uuid', nullable: true })
  token: string | undefined;
}
