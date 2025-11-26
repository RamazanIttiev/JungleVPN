import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
import { mapPeriodToDate } from '@utils/utils';
import { add } from 'date-fns';
import { InlineKeyboard } from 'grammy';

@Injectable()
export class PaymentStatusMsgService extends Base {
  constructor(
    readonly remnaService: RemnaService,
    readonly paymentService: PaymentsService,
    readonly userService: UserService,
  ) {
    super();
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    if (!session.user.uuid) {
      await this.userService.init(ctx);
    }

    const { uuid, expireAt } = session.user;
    const { paymentId, paymentUrl, selectedPeriod } = session;

    if (!paymentUrl || !uuid || !expireAt || !selectedPeriod) {
      await ctx.reply(ctx.t('error-generic-restart'));
      return;
    }

    if (!paymentId) {
      await ctx.reply(ctx.t('payment-not-found'));
      return;
    }

    const status = await this.paymentService.checkPaymentStatus(paymentId);

    if (status === 'succeeded') {
      const newExpireAt = add(expireAt || new Date(), {
        months: mapPeriodToDate(selectedPeriod),
      }).toISOString();

      await this.paymentService.updatePayment(paymentId, { status, paidAt: new Date() });
      await this.remnaService.updateUser({
        uuid,
        expireAt: newExpireAt,
      });

      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.log(error);
      }

      const stickerId = process.env.PAYMENT_SUCCESS_STICKER;
      const successMenu = new InlineKeyboard().text(ctx.t('connect-button-label'), 'paymentSuccess');

      if (stickerId) {
        await ctx.replyWithSticker(stickerId, { reply_markup: successMenu });
      } else {
        await ctx.reply(ctx.t('payment-success'), { reply_markup: successMenu });
      }

      ctx.session = {
        ...session,
        user: {
          ...session.user,
          expireAt: newExpireAt,
        },
      };
    } else {
      await ctx.reply(ctx.t('payment-pending'));
    }
  }
}
