import { Column, Entity, PrimaryColumn } from 'typeorm';

type UserStatus = 'trial' | 'expired' | 'active';
type UserClient = {
  id: string;
  device: string;
  subId: string;
};

@Entity('users')
export class User {
  @PrimaryColumn() id: string;
  @Column({ nullable: true }) expiryTime: string;
  @Column({ default: 'active' }) status: UserStatus;
  @Column({ type: 'jsonb', nullable: true })
  clients: UserClient[];
  @Column({ nullable: true }) first_name: string;
  @Column({ nullable: true }) username?: string;
  @Column({ nullable: true }) language_code?: string;
}
