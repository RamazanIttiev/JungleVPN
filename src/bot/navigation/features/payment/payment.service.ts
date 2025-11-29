import { BotContext } from '@bot/bot.types';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { Base } from '@bot/navigation/menu.base';
import { getPaymentPageContent } from '@bot/utils/templates';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PaymentMsgService extends Base {
  constructor(
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super();
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const { selectedPeriod, selectedAmount } = session;

    if (!selectedPeriod || !selectedAmount) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    const content = getPaymentPageContent(selectedPeriod, selectedAmount);

    await this.render(ctx, content, this.paymentMenu.menu);
  }
}
