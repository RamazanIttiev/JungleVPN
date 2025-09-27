import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InboundClientEntity } from '../xui/inbound.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) telegramId: string;

  @CreateDateColumn() createdAt: Date;

  @OneToMany(
    () => User,
    (d) => d.clients,
  )
  clients: InboundClientEntity[];
}
