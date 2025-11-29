import { Menu } from '@bot/navigation';
import { PaymentMethodMsgService } from '@bot/navigation/features/payment/payment-method/payment-method.service';
import { Base } from '@bot/navigation/menu.base';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PaymentMethodMenu extends Base implements OnModuleInit {
  menu = new Menu('payment-methods-menu');

  constructor(readonly paymentMethodMsgService: PaymentMethodMsgService) {
    super();
  }

  onModuleInit() {
    this.menu
      .text(
        (ctx) => ctx.t('payment-method-usd'),
        async (ctx) => {
          await this.paymentMethodMsgService.handlePaymentMethod(ctx, 'stripe');
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('payment-method-rub'),
        async (ctx) => {
          await this.paymentMethodMsgService.handlePaymentMethod(ctx, 'yookassa');
        },
      );
  }
}
