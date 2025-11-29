import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { Base } from '@bot/navigation/menu.base';
import { paymentAmounts, paymentPeriods } from '@bot/utils/constants';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { mapPeriodLabelToPriceLabel } from '@utils/utils';

@Injectable()
export class PaymentsPeriodsMenu extends Base implements OnModuleInit {
  readonly menu = new Menu('paymentPeriods-menu');

  constructor(
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    readonly paymentMethodMenu: PaymentMethodMenu,
  ) {
    super();
  }

  onModuleInit() {
    if (paymentPeriods.length !== paymentAmounts.length) {
      throw new Error('PAYMENT_PERIODS and PAYMENT_AMOUNTS lengths must match');
    }

    this.menu.dynamic((_, range) => {
      paymentPeriods.forEach((period, index) => {
        range.text(
          (ctx) =>
            ctx.t(mapPeriodLabelToPriceLabel(period), {
              amount: paymentAmounts[index],
              currency: '$',
            }),
          async (ctx) => {
            ctx.session.selectedPeriod = period;
            ctx.session.selectedAmount = paymentAmounts[index];
            await this.render(ctx, ctx.t('payment-methods-text'), this.paymentMethodMenu.menu);
          },
        );
        range.row();
      });

      range.row();
      range.text({ text: (ctx) => ctx.t('back-button-label') }, async (ctx) => {
        await this.mainMsgService.init(ctx, this.mainMenu.menu);
      });
    });
  }
}
