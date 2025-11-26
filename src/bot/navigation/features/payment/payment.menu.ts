import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentStatusMsgService } from '@bot/navigation/features/payment/paymentStatus.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PaymentMenu extends Base implements OnModuleInit {
  menu = new Menu('payment-menu');

  constructor(
    readonly paymentStatusMsgService: PaymentStatusMsgService,
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
  ) {
    super();
  }

  onModuleInit() {
    this.menu
      .dynamic(async (ctx, range) => {
        const paymentUrl = ctx.session.paymentUrl;
        if (paymentUrl) {
          range.url((ctx) => ctx.t('pay-button-label'), paymentUrl);
        }
      })
      .text((ctx) => ctx.t('paid-button-label'), async (ctx) => {
        await this.paymentStatusMsgService.init(ctx);
      })
      .row()
      .text((ctx) => ctx.t('main-menu-button-label'), async (ctx) => {
        await this.mainMsgService.init(ctx, this.mainMenu.menu);
      });
  }
}
