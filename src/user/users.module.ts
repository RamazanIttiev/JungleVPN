import { BotService } from '@bot/bot.service';
import { Module } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';

@Module({
  exports: [UserService],
  providers: [UserService, BotService, RemnaService],
})
export class UserModule {}
