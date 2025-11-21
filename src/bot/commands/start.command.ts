import { BotContext, initialSession } from '@bot/bot.types';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';
import { ReferralService } from '../../referral/referral.service';
import { decodeReferralCode } from '../../referral/referral.utils';

@Injectable()
export class StartCommand {
  constructor(
    readonly mainMenu: MainMenu,
    readonly mainMsgService: MainMsgService,
    readonly referralService: ReferralService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🍌');

      const payload = ctx.match;
      if (payload?.startsWith('ref_')) {
        const code = payload.replace('ref_', '');
        const inviterId = decodeReferralCode(code);

        if (inviterId && ctx.from?.id) {
          const referral = await this.referralService.handleNewUser(ctx, inviterId, ctx.from.id);
          if (referral === null) return;
        }
      }

      ctx.session.user = initialSession().user;
      await this.mainMsgService.init(ctx, this.mainMenu.menu);
    });
  }
}
