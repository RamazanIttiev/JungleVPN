import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users/user.entity";

export type PaymentStatus = "pending" | "paid" | "failed";

@Entity("payments")
export class Payment {
	@PrimaryGeneratedColumn("uuid")
	id!: string;

	@ManyToOne(
		() => User,
		(u) => u.payments,
		{ eager: true },
	)
	user!: User;

	@Column("integer")
	amount!: number;

	@Column({ type: "varchar" })
	status!: PaymentStatus;

	@CreateDateColumn()
	createdAt!: Date;
}
