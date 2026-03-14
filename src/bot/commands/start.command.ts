import { BotContext, initialSession } from '@bot/bot.types';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMenuService } from '@bot/navigation/features/main/main.service';
import { toDateString } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { ReferralService } from '@referral/referral.service';
import { decodeReferralCode } from '@referral/referral.utils';
import { UserService } from '@user/user.service';
import { Bot } from 'grammy';
import { AnalyticsService } from '../../analytics/analytics.service';

@Injectable()
export class StartCommand {
  constructor(
    readonly mainMenu: MainMenu,
    readonly mainMenuService: MainMenuService,
    readonly userService: UserService,
    readonly referralService: ReferralService,
    readonly analyticsService: AnalyticsService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
      await ctx.react('🍌');
      await this.userService.init(ctx);
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
      await this.mainMenuService.init(ctx, this.mainMenu.menu);

      if (payload?.startsWith('ad_')) {
        await this.addData(payload, ctx.from?.id || 0);
      }

      if (payload?.startsWith('web_app')) {
        await this.addData(payload, ctx.from?.id || 0);
      }
    });
  }

  async addData(channel: string, userId: number) {
    await this.analyticsService.addData({
      channel,
      userId,
      dateAndTime: toDateString(new Date().toISOString(), true),
      sheetId: `${process.env.GOOGLE_SHEET_TITLE}!A2`,
    });
  }
}
