import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserLocale } from '@user/user.model';
import { UserService } from '@user/user.service';
import { isValidUsername } from '@utils/utils';
import { Bot, InlineKeyboard } from 'grammy';
import { ReferralService } from '../../referral/referral.service';

@Injectable()
export class InlineQueryListener {
  bot: Bot<BotContext>;

  constructor(
    @Inject(forwardRef(() => BotService))
    private readonly botService: BotService,
    private readonly referralService: ReferralService,
    private readonly userService: UserService,
    private readonly localService: LocalisationService,
  ) {
    this.bot = this.botService.bot;
  }

  register(bot: Bot<BotContext>) {
    bot.on('inline_query', async (ctx) => {
      const link = this.referralService.getUserReferralLink(ctx.from.id);
      const tgUser = this.userService.validateUser(ctx.from);
      const user = await this.userService.getUserByTgId(tgUser.id);
      const locale = (user?.description || process.env.DEFAULT_LOCALE || 'ru') as UserLocale;

      const keyboard = new InlineKeyboard().url(
        this.localService.i18n.t(locale, 'connect-button-label'),
        link,
      );
      const username = isValidUsername(ctx.from?.username)
        ? ctx.from?.username
        : ctx.t('dear-friend');

      const title = this.localService.i18n.t(locale, 'invite-inline-title');
      const description = this.localService.i18n.t(locale, 'invite-inline-description');

      await ctx.answerInlineQuery([
        {
          type: 'article',
          id: 'referral-link',
          title,
          thumbnail_url: `${process.env.BASE_URL}/assets/logo.jpg`,
          description,
          input_message_content: {
            message_text: ctx.t('invitation-text', {
              username: username!,
              trial_period: Number(process.env.TRIAL_PERIOD_IN_DAYS),
            }),
            parse_mode: 'HTML',
          },
          reply_markup: keyboard,
        },
      ]);
    });
  }
}
