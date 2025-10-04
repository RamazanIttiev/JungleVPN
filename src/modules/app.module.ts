import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { XuiModule } from './xui/xui.module';

@Module({
  imports: [BotModule, XuiModule],
})
export class AppModule {}
