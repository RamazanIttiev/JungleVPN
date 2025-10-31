import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation/core/menu';
import { BaseMenu } from '@bot/navigation/core/menu/base.menu';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserDevice } from '@users/users.model';

@Injectable()
export class DevicesMenu extends BaseMenu {
  readonly menu = new Menu('devices-menu');

  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.menu
      .text('ios', async (ctx) => {
        await this.handleClick(ctx, 'ios');
      })
      .text('android', async (ctx) => {
        await this.handleClick(ctx, 'android');
      })
      .row()
      .text('macOS', async (ctx) => {
        await this.handleClick(ctx, 'macOS');
      })
      .text('windows', async (ctx) => {
        await this.handleClick(ctx, 'windows');
      })
      .row()
      .back('Назад', async (ctx) => {
        await this.navigateTo(ctx,'main');
      });
  }

  async handleClick(ctx: BotContext, device: UserDevice) {
    const { user, tgUser } = await this.loadUser(ctx);

    const now = Date.now();
    const expireAt = new Date(now);
    expireAt.setDate(expireAt.getDate() + 90);

    if (!user) {
      await this.remnaService.createUser({
        username: tgUser.username || tgUser.first_name,
        expireAt: expireAt.toISOString(),
        telegramId: tgUser.id,
      });
    }

    const isExpired = user ? Date.now().toString() > user?.expireAt : false;

    if (isExpired) {
      await this.navigateTo(ctx,'main');
      return;
    }

    ctx.session = {
      ...ctx.session,
      subUrl: user?.subscriptionUrl,
      redirectUrl: `https://in.thejungle.pro/redirect?link=v2raytun://import/${user?.subscriptionUrl}`,
      selectedDevice: device,
    };

    await this.navigateTo(ctx,'subscription');
  }

  create() {
    return this.menu;
  }
}
