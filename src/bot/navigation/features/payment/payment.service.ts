import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { mapAmountLabel, mapPeriodLabel } from '@utils/utils';

@Injectable()
export class PaymentMsgService extends Base {
  constructor(
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super();
  }

  async init(ctx: BotContext, menu: Menu) {
    const session = ctx.session;
    const { paymentUrl, paymentId, selectedPeriod, selectedAmount } = session;

    if (!paymentUrl || !paymentId || !selectedPeriod || !selectedAmount) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    const content = ctx.t('payment-text', {
      amount: mapAmountLabel(selectedAmount),
      period: mapPeriodLabel(selectedPeriod),
    });

    await this.render(ctx, content, menu);
  }
}
