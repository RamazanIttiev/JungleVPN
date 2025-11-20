import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentPeriodsMsgService } from '@bot/navigation/features/payment/payment-periods/payment-periods.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { mapPeriodLabelToPriceLabel } from '@utils/utils';

@Injectable()
export class PaymentsPeriodsMenu extends Base implements OnModuleInit {
  readonly menu = new Menu('paymentPeriods-menu');

  constructor(
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => PaymentPeriodsMsgService))
    readonly paymentPeriodsMsgService: PaymentPeriodsMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super();
  }

  onModuleInit() {
    if (
      this.paymentPeriodsMsgService.periods.length !== this.paymentPeriodsMsgService.amounts.length
    ) {
      throw new Error('PAYMENT_PERIODS and PAYMENT_AMOUNTS lengths must match');
    }

    this.menu.dynamic((_, range) => {
      this.paymentPeriodsMsgService.periods.forEach((period) => {
        range.text(
          mapPeriodLabelToPriceLabel(period),
          async (ctx) => await this.paymentPeriodsMsgService.handlePaymentPeriod(ctx, period),
        );
        range.row();
      });

      range.row();
      range.text({ text: '⤴ Назад' }, async (ctx) => {
        await this.mainMsgService.init(ctx, this.mainMenu.menu);
      });
    });
  }
}
