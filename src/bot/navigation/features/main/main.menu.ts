import * as process from 'node:process';
import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MainMenu extends Base {
  readonly menu = new Menu('main-menu');

  constructor(
    @Inject(forwardRef(() => DevicesMenu))
    readonly devicesMenu: DevicesMenu,
    @Inject(forwardRef(() => PaymentsPeriodsMenu))
    readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
  ) {
    super();

    this.menu
      .text('Подключиться 📶', async (ctx) => {
        await ctx.editMessageText(ctx.t('devices-text'), {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: this.devicesMenu.menu,
        });
      })
      .text('Продлить ➕', async (ctx) => {
        await ctx.editMessageText(ctx.t('payment-periods-text'), {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: this.paymentsPeriodsMenu.menu,
        });
      })
      .row()
      .url('Нужна помощь?', process.env.SUPPORT_URL || 'https://t.me/JungleVPN_support');
  }
}
