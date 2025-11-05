import { BotService } from '@bot/bot.service';
import { UserService } from '@bot/user.service';
import { Module } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Module({
  exports: [UserService],
  providers: [UserService, BotService, RemnaService],
})
export class UsersModule {}
