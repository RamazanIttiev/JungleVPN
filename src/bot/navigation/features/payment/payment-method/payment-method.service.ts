import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentProvider } from '@payments/payment.entity';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { mapPeriodToDate } from '@utils/utils';

@Injectable()
export class PaymentMethodMsgService extends Base {
  constructor(
    readonly remnaService: RemnaService,
    readonly paymentsService: PaymentsService,
    readonly paymentMsgService: PaymentMsgService,
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super();
  }

  async init(ctx: BotContext, menu: Menu) {
    const content = 'Choose method';

    await this.render(ctx, content, menu);
  }

  async handlePaymentMethod(ctx: BotContext, provider: PaymentProvider) {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    const { selectedPeriod, selectedAmount } = session;

    if (!user || !selectedPeriod || !selectedAmount) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    const { id, url } = await this.paymentsService.createPayment(
      {
        userId: tgUser.id,
        amount: selectedAmount,
        currency: provider === 'yookassa' ? 'RUB' : 'USD',
        metadata: {
          selectedPeriod: mapPeriodToDate(selectedPeriod),
          telegramId: tgUser.id,
          telegramMessageId: ctx.msg?.message_id,
        },
        description: process.env.PAYMENT_PROVIDER_DESCRIPTION,
      },
      provider,
    );

    this.updateSession(ctx, id, url);

    await this.paymentMsgService.init(ctx);
  }

  private updateSession(ctx: BotContext, id: string, url: string) {
    ctx.session.paymentId = id;
    ctx.session.paymentUrl = url;
  }
}
