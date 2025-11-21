import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '@user/user.service';
import { Referral } from '../referral/referral.entity';
import { ReferralService } from '../referral/referral.service';
import { RemnaService } from './remna.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  providers: [RemnaService, ReferralService, UserService],
  exports: [RemnaService],
})
export class RemnaModule {}
