import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { Base } from '@bot/navigation/menu.base';
import { paymentPeriods } from '@bot/utils/constants';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentPeriod } from '@payments/payments.model';
import { UserLocale } from '@user/user.model';
import { mapPeriodLabelToPriceLabel } from '@utils/utils';

@Injectable()
export class PaymentsPeriodsMenu extends Base implements OnModuleInit {
  readonly menu = new Menu('paymentPeriods-menu');

  constructor(
    readonly config: ConfigService,
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    readonly paymentMethodMenu: PaymentMethodMenu,
  ) {
    super();
  }

  onModuleInit() {
    this.menu.dynamic((ctx, range) => {
      const locale = ctx.from?.language_code as UserLocale;

      paymentPeriods.forEach((item) => {
        const period = item.toUpperCase() as PaymentPeriod;
        range.text(
          (ctx) =>
            ctx.t(mapPeriodLabelToPriceLabel(item), {
              amount:
                this.config.get<number>(
                  locale === 'ru' ? `PRICE_RUB_${period}` : `PRICE_USD_${period}`,
                ) || 0,
              currency: locale === 'ru' ? '₽' : '$',
            }),

          async (ctx) => {
            ctx.session.selectedPeriod = item;
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
