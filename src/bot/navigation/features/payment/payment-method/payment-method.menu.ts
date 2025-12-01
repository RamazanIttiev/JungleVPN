import { Menu } from '@bot/navigation';
import { PaymentMethodMsgService } from '@bot/navigation/features/payment/payment-method/payment-method.service';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PaymentMethodMenu extends Base implements OnModuleInit {
  menu = new Menu('payment-methods-menu');

  constructor(
    readonly paymentMethodMsgService: PaymentMethodMsgService,
    @Inject(forwardRef(() => PaymentsPeriodsMenu))
    readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
  ) {
    super();
  }

  onModuleInit() {
    this.menu
      .text(
        (ctx) => ctx.t('payment-method-usd'),
        async (ctx) => {
          ctx.session.selectedProvider = 'stripe';
          await this.paymentMethodMsgService.handlePaymentMethod(ctx, 'stripe');
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('payment-method-rub'),
        async (ctx) => {
          ctx.session.selectedProvider = 'yookassa';
          await this.paymentMethodMsgService.handlePaymentMethod(ctx, 'yookassa');
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('back-button-label'),
        async (ctx) => {
          await this.render(ctx, ctx.t('payment-periods-text'), this.paymentsPeriodsMenu.menu);
        },
      );
  }
}
