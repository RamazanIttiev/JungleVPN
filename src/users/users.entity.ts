import { UserDevice, UserStatus } from '@users/users.model';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryColumn({ default: 0 }) id: number;
  @Column({ nullable: true, type: 'bigint' }) expiryTime: number;
  @Column({ default: 'new' }) status: UserStatus;
  @OneToMany(
    () => Client,
    (client) => client.user,
    { cascade: true, eager: true },
  )
  clients: Client[];
  @Column({ nullable: true }) first_name: string;
  @Column({ nullable: true }) username?: string;
  @Column({ nullable: true }) language_code?: string;
}

@Entity('devices')
export class Client {
  @PrimaryColumn({ default: 0 })
  id: string;

  @Column({ nullable: true })
  device: UserDevice;

  @Column({ nullable: true })
  subId: string;

  @ManyToOne(
    () => User,
    (user) => user.clients,
    { onDelete: 'CASCADE' },
  )
  user?: User;
}
