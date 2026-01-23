import { BotContext } from '@bot/bot.types';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { mapPeriodToMonthsNumber } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { CurrencyService } from '@payments/currency-service/currency.service';
import { PaymentProvider } from '@payments/payments.model';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';

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

    const { url } = await this.paymentsService.createPaymentFromProvider({
      userId: tgUser.id.toString(),
      payment: {
        amount,
        currency,
        provider,
        description: ctx.t('provider-description-text'),
      },
      metadata: {
        description: ctx.t('provider-description-text'),
        selectedPeriod: mapPeriodToMonthsNumber(selectedPeriod),
        telegramMessageId: ctx.msg?.message_id,
        telegramId: tgUser.id.toString(),
      },
    });

    ctx.session.paymentUrl = url;

    await this.paymentMsgService.init(ctx);
  }
}
