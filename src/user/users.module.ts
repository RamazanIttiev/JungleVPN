import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from '@referral/referral.entity';
import { ReferralService } from '@referral/referral.service';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  exports: [UserService],
  providers: [UserService, RemnaService, ReferralService],
})
export class UserModule {}
