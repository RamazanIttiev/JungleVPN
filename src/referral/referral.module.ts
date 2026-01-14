import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { Referral } from './referral.entity';
import { ReferralService } from './referral.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  exports: [ReferralService],
  providers: [UserService, RemnaService, ReferralService],
})
export class ReferralModule {}
