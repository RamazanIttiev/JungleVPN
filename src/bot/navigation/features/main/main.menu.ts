import * as process from 'node:process';
import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { Base } from '@bot/navigation/menu.base';
import { getDevicesPageContent, getPaymentPeriodsPage } from '@bot/utils/templates';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { ReferralService } from '../../../../referral/referral.service';

@Injectable()
export class MainMenu extends Base {
  readonly menu = new Menu('main-menu');

  constructor(
    readonly userService: UserService,
    readonly referralService: ReferralService,
    @Inject(forwardRef(() => DevicesMenu))
    readonly devicesMenu: DevicesMenu,
    @Inject(forwardRef(() => PaymentsPeriodsMenu))
    readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
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
      .row()
      .url('Партерка', async (ctx) => {
        const user = this.userService.validateUser(ctx.from);
        const link = this.referralService.getUserReferralLink(user.id);
        return `https://t.me/share/&text=@ten_vpn_botU+0020invite`;
      })
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
