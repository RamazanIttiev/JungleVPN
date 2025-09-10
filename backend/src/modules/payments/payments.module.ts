import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { Payment } from "./payment.entity";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
	imports: [TypeOrmModule.forFeature([Payment]), UsersModule],
	providers: [PaymentsService],
	controllers: [PaymentsController],
	exports: [PaymentsService],
})
export class PaymentsModule {}
