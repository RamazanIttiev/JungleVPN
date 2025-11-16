import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getUserNotConnectedContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebHookEvent } from '@remna/remna.model';
import { UserDto } from '@user/user.model';
import { AxiosError } from 'axios';
import { Bot, InlineKeyboard } from 'grammy';

@Injectable()
export class UserNotConnectedListener {
  bot: Bot<BotContext>;

  constructor(private readonly botService: BotService) {
    this.bot = this.botService.bot;
  }

  @OnEvent('user.not_connected')
  async listenToUserNotConnectedEvent(payload: {
    event: WebHookEvent;
    data: Pick<UserDto, 'telegramId'>;
    timestamp: string;
  }) {
    const keyboard = new InlineKeyboard();

    keyboard.text('Подключиться 📶', 'navigate_devices');
    keyboard.text('Главное меню 🏠', 'navigate_main');

    if (!payload.data.telegramId) {
      throw new AxiosError('UserNotConnectedListener: telegramId is null');
    }

    await this.bot.api.sendMessage(payload.data.telegramId, getUserNotConnectedContent(), {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }
}
