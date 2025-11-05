import { BotService } from '@bot/bot.service';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { DevicesMenu } from '@bot/navigation/core/menu/features/devices/devices.menu';
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

    this.menu.text('Подключиться 📶', async (ctx) => {
      await ctx.editMessageText(getDevicesPageContent(), {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: this.devicesMenu.menu,
      });
    });
  }
}
