import { Module } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';

@Module({
  exports: [UserService],
  providers: [UserService, RemnaService],
})
export class UserModule {}
