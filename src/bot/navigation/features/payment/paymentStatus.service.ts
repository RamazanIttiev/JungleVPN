import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/menu.base';
import { mapPeriodToDate } from '@utils/utils';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { UserService } from '@user/user.service';
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

    const { uuid, expireAt, username } = session.user;
    const { paymentId, paymentUrl, selectedPeriod } = session;

    if (!paymentUrl) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    if (!paymentId) {
      await ctx.reply('❗ Платеж не найден. Попробуй заново /start');
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
        username,
        expireAt: newExpireAt,
        status: 'ACTIVE',
      });

      try {
        await ctx.deleteMessage();
      } catch (error) {
        console.log(error);
      }

      const stickerId = process.env.PAYMENT_SUCCESS_STICKER;
      const successMenu = new InlineKeyboard().text('Подключиться 📶', 'paymentSuccess');

      if (stickerId) {
        await ctx.replyWithSticker(stickerId, { reply_markup: successMenu });
      } else {
        await ctx.reply('✅ Оплата прошла успешно!', { reply_markup: successMenu });
      }

      ctx.session = {
        ...session,
        user: {
          ...session.user,
          expireAt: newExpireAt,
        },
      };
    } else {
      await ctx.reply('❗ Платеж еще не оплачен.');
    }
  }
}
