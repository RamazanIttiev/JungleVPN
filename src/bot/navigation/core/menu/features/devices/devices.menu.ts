import { BotService } from '@bot/bot.service';
import { BotContext, UserDevice } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { MainMenu } from '@bot/navigation/core/menu/features/main/main.menu';
import { MainService } from '@bot/navigation/core/menu/features/main/main.service';
import { mapDeviceLabel } from '@bot/utils/utils';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class DevicesMenu extends Base {
  readonly menu = new Menu('devices-menu');
  private devices: UserDevice[] = JSON.parse(
    process.env.USER_DEVICES || '["ios","android","macOS","windows"]',
  );

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly mainService: MainService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
  ) {
    super(botService, remnaService);

    this.menu.dynamic((_, range) => {
      this.devices.forEach((device, i) => {
        range.text(mapDeviceLabel(device), async (ctx) => await this.selectDevice(ctx, device));
        if (i % 2 === 1) range.row();
      });

      range.row();
      range.text({ text: '⬅ Назад' }, async (ctx) => {
        await this.mainService.init(ctx, this.mainMenu.menu);
      });
    });
  }

  private async selectDevice(ctx: BotContext, device: UserDevice) {
    ctx.session.selectedDevice = device;
  }
}
