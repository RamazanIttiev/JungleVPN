import { BotContext } from '@bot/bot.types';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { CurrencyService } from '@payments/currency-service/currency.service';
import { PaymentProvider } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { mapPeriodToMonthsNumber } from '@utils/utils';

@Injectable()
export class PaymentMethodMsgService extends Base {
  constructor(
    readonly remnaService: RemnaService,
    readonly paymentsService: PaymentsService,
    readonly paymentMsgService: PaymentMsgService,
    readonly currencyService: CurrencyService,
  ) {
    super();
  }

  async handlePaymentMethod(ctx: BotContext, provider: PaymentProvider) {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    const { selectedPeriod } = session;

    if (!user || !selectedPeriod) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    const { amount, currency } = this.currencyService.getPriceForPeriod(selectedPeriod, provider);

    const { url } = await this.paymentsService.createPayment(
      {
        userId: tgUser.id.toString(),
        payment: {
          amount,
          provider,
          currency,
          description: ctx.t('provider-description-text'),
        },
        metadata: {
          selectedPeriod: mapPeriodToMonthsNumber(selectedPeriod),
          telegramId: tgUser.id,
          telegramMessageId: ctx.msg?.message_id,
        },
      },
      provider,
    );

    ctx.session.paymentUrl = url;

    await this.paymentMsgService.init(ctx);
  }
}
