import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserDevice } from '@user/user.model';
import { mapDeviceLabel } from '@utils/utils';

@Injectable()
export class DevicesMenu extends Base {
  readonly menu = new Menu('devices-menu');
  private devices: UserDevice[] = JSON.parse(
    process.env.USER_DEVICES || '["ios","android","macOS","windows"]',
  );

  constructor(
    readonly mainMsgService: MainMsgService,
    readonly subscriptionMsgService: SubscriptionMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    @Inject(forwardRef(() => SubscriptionMenu))
    readonly subscriptionMenu: SubscriptionMenu,
  ) {
    super();

    this.menu.dynamic((_, range) => {
      this.devices.forEach((device, i) => {
        range.text(mapDeviceLabel(device), async (ctx) => await this.selectDevice(ctx, device));
        if (i % 2 === 1) range.row();
      });

      range.row();
      range.text({ text: '⤴ Назад' }, async (ctx) => {
        await this.mainMsgService.init(ctx, this.mainMenu.menu);
      });
    });
  }

  private async selectDevice(ctx: BotContext, device: UserDevice) {
    ctx.session.selectedDevice = device;
    await this.subscriptionMsgService.init(ctx, this.subscriptionMenu.menu);
  }
}
