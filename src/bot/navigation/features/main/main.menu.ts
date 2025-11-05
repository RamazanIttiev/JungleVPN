import { BotService } from '@bot/bot.service';
import { Base } from '@bot/navigation/menu.base';
import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods.menu';
import { getDevicesPageContent, getPaymentPeriodsPage } from '@bot/utils/templates';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class MainMenu extends Base {
  readonly menu = new Menu('main-menu');

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    @Inject(forwardRef(() => DevicesMenu))
    readonly devicesMenu: DevicesMenu,
    @Inject(forwardRef(() => PaymentsPeriodsMenu))
    readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
  ) {
    super(botService, remnaService);

    this.menu
      .text('Подключиться 📶', async (ctx) => {
        await ctx.editMessageText(getDevicesPageContent(), {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: this.devicesMenu.menu,
        });
      })
      .text('Продлить ➕', async (ctx) => {
        await ctx.editMessageText(getPaymentPeriodsPage(), {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: this.paymentsPeriodsMenu.menu,
        });
      });
  }
}
