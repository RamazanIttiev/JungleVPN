import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Broadcast } from './broadcast.entity';

@Entity('broadcast_messages')
export class BroadcastMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Broadcast, { onDelete: 'CASCADE' })
  broadcast: Broadcast;

  @Column({ type: 'bigint' })
  telegramId: string; // Storing as string to be safe with bigints, though number is usually fine for user IDs < 2^53.

  @Column({ type: 'int' })
  messageId: number;
}
