import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/menu.base';
import { mapPeriodToDate } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { add } from 'date-fns';
import { InlineKeyboard } from 'grammy';

@Injectable()
export class PaymentStatusMsgService extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly paymentService: PaymentsService,
  ) {
    super(botService, remnaService);
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
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

      await ctx.deleteMessage();
      await ctx.replyWithSticker(process.env.PAYMENT_SUCCESS_STICKER || '', {
        reply_markup: new InlineKeyboard().text('Подключиться 📶', 'paymentSuccess'),
      });

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
