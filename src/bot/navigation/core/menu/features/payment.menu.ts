import { BotService } from '@bot/bot.service';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class PaymentMenu extends Base {
  menu = new Menu('payment-menu');

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.menu
      .dynamic(async (ctx, range) => {
        const paymentUrl = ctx.session.paymentUrl;
        if (paymentUrl) {
          range.url('💳 Оплатить подписку', paymentUrl);
        }
      })
      .text('Я оплатил ✅', async (ctx) => {
        await this.navigateTo(ctx, 'paymentStatus');
      })
      .row()
      .text('Главное меню', async (ctx) => {
        await this.navigateTo(ctx, 'main');
      });
  }

  create() {
    return this.menu;
  }
}
