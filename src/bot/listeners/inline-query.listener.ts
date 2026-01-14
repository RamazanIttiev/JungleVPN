import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { getInvitationContent } from '@bot/utils/templates';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Bot, InlineKeyboard } from 'grammy';
import { ReferralService } from '../../referral/referral.service';

@Injectable()
export class InlineQueryListener {
  bot: Bot<BotContext>;

  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
    private readonly referralService: ReferralService,
  ) {
    this.bot = this.botService.bot;
  }

  register(bot: Bot<BotContext>) {
    bot.on('inline_query', async (ctx) => {
      const link = this.referralService.getUserReferralLink(ctx.from.id);
      const keyboard = new InlineKeyboard().url('Подключиться 📶', link);

      await ctx.answerInlineQuery([
        {
          type: 'article',
          id: 'referral-link',
          title: 'Пригласи друга в JUNGLE 🌴',
          thumbnail_url: `${process.env.BASE_URL}/assets/logo.jpg`,
          description: 'Отправь эту карточку другу и получи доп дни в подписку 🙃',
          input_message_content: {
            message_text: getInvitationContent(),
            parse_mode: 'HTML',
          },
          reply_markup: keyboard,
        },
      ]);
    });
  }
}
