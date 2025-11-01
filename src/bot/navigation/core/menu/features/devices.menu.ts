import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { mapDeviceLabel } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserDevice } from '@users/users.model';

@Injectable()
export class DevicesMenu extends Base {
  readonly menu = new Menu('devices-menu');
  private devices = JSON.parse(process.env.USER_DEVICES || '["ios","android","macOS","windows"]');

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    for (const [i, device] of this.devices.entries()) {
      if (i > 0 && i % 2 === 0) this.menu.row();
      this.menu.text(mapDeviceLabel(device), async (ctx) => await this.selectDevice(ctx, device));
    }

    this.menu.row().back('⬅ Назад', async (ctx) => {
      await this.navigateTo(ctx, 'main');
    });
  }

  private async selectDevice(ctx: BotContext, device: UserDevice) {
    ctx.session.selectedDevice = device;

    await this.navigateTo(ctx, 'subscription');
  }

  create() {
    return this.menu;
  }
}
