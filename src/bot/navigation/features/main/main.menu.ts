import * as process from 'node:process';
import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { ReferralMenu } from '@bot/navigation/features/referral/referral.menu';
import { ReferralMsgService } from '@bot/navigation/features/referral/referral.service';
import { Base } from '@bot/navigation/menu.base';
import { getDevicesPageContent, getPaymentPeriodsPage } from '@bot/utils/templates';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MainMenu extends Base {
  readonly menu = new Menu('main-menu');

  constructor(
    @Inject(forwardRef(() => DevicesMenu))
    readonly devicesMenu: DevicesMenu,
    @Inject(forwardRef(() => PaymentsPeriodsMenu))
    readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
    @Inject(forwardRef(() => ReferralMenu))
    readonly referralMenu: ReferralMenu,
    readonly referralMsgService: ReferralMsgService,
  ) {
    super();

    this.menu
      .text('Подключиться 📶', async (ctx) => {
        await ctx.editMessageText(getDevicesPageContent(), {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: this.devicesMenu.menu,
        });
      })
      .text('Партнерка 🤝', async (ctx) => {
        await this.referralMsgService.init(ctx, this.referralMenu.menu);
      })
      .row()
      .text('Продлить ➕', async (ctx) => {
        await ctx.editMessageText(getPaymentPeriodsPage(), {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: this.paymentsPeriodsMenu.menu,
        });
      })
      .row()
      .url('Нужна помощь?', process.env.SUPPORT_URL || 'https://t.me/JungleVPN_support');
  }
}
