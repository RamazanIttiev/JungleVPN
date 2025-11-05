import { BotService } from '@bot/bot.service';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { DevicesMenu } from '@bot/navigation/core/menu/features/devices.menu';
import { getDevicesPageContent } from '@bot/utils/templates';
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
  ) {
    super(botService, remnaService);

    this.menu
      .text('Подключиться 📶', async (ctx) => {
        const isExpired = this.isExpired(ctx.session.user?.expireAt);

        if (isExpired) {
          await this.navigateTo(ctx, 'paymentPeriods');
          return;
        }

        await ctx.menu.nav('devices-menu', { immediate: true });
        await this.render(ctx, getDevicesPageContent(), this.devicesMenu.create());
      })
      .text('Продлить подписку', async (ctx) => {
        await this.navigateTo(ctx, 'paymentPeriods');
      });
  }

  create() {
    return this.menu;
  }
}
