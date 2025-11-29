import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PaymentMenu extends Base implements OnModuleInit {
  menu = new Menu('payment-menu');

  constructor(
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
  ) {
    super();
  }

  onModuleInit() {
    this.menu
      .url('💳 Оплатить подписку', (ctx) => {
        return ctx.session.paymentUrl || 'https://example.com';
      })
      .row()
      .text(
        'Главное меню 🏠',
        async (ctx) => await this.mainMsgService.init(ctx, this.mainMenu.menu),
      );
  }
}
