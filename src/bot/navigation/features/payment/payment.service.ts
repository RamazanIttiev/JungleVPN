import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/menu.base';
import { Menu } from '@bot/navigation';
import { getPaymentPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class PaymentMsgService extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(ctx: BotContext, menu: Menu) {
    const session = ctx.session;
    const { paymentUrl, paymentId, selectedPeriod, selectedAmount } = session;

    if (!paymentUrl || !paymentId) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      return;
    }

    const content = getPaymentPageContent(selectedPeriod!, selectedAmount!);

    await this.render(ctx, content, menu);
  }
}
