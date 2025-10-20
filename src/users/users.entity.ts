import { Column, Entity, PrimaryColumn } from 'typeorm';
export type UserStatus = 'trial' | 'expired' | 'active';
export type UserClient = {
  id: string;
  device: string;
  subId: string;
};
@Entity('users')
export class User {
  @PrimaryColumn({ default: 0, type: 'bigint' }) id: number;
  @Column({ nullable: true, type: 'bigint' }) expiryTime: number;
  @Column({ default: 'active' }) status: UserStatus;
  @Column({ type: 'jsonb', nullable: true })
  clients: UserClient[];
  @Column({ nullable: true }) first_name: string;
  @Column({ nullable: true }) username?: string;
  @Column({ nullable: true }) language_code?: string;
}
