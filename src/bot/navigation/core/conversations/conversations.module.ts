import { BotService } from '@bot/bot.service';
import { ConversationService } from '@bot/navigation/core/conversations/conversations.service';
import { DevicesMenu } from '@bot/navigation/devices.menu';
import { MainMenu } from '@bot/navigation/main.menu';
import { SubscriptionMenu } from '@bot/navigation/subscription.menu';
import { Module } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Module({
  exports: [ConversationService],
  providers: [
    ConversationService,
    MainMenu,
    SubscriptionMenu,
    DevicesMenu,
    BotService,
    RemnaService,
  ],
})
export class ConversationModule {}
