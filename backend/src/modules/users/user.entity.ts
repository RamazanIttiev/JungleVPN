import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from '../payments/payment.entity';
import { Peer } from '../peers/peer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) telegramId: string;

  @CreateDateColumn() createdAt: Date;

  @OneToMany(
    () => Payment,
    (p) => p.user,
  )
  payments: Payment[];

  @OneToMany(
    () => Peer,
    (d) => d.user,
  )
  peers: Peer[];
}
