import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Payment } from "../payments/payment.entity";
import { Peer } from "../peers/peer.entity";

@Entity("users")
export class User {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@Column({ unique: true })
	telegramId!: string;

	@CreateDateColumn()
	createdAt!: Date;

	@Column({ type: "timestamp", nullable: true })
	expiresAt!: Date | null;

	@Column({ default: false })
	active!: boolean;

	@OneToMany(
		() => Payment,
		(p) => p.user,
	)
	payments!: Payment[];

	@OneToOne(
		() => Peer,
		(peer) => peer.user,
	)
	peer!: Peer;
}
