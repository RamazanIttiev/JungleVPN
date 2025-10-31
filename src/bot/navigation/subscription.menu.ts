import { BotService } from '@bot/bot.service';
import { Menu } from '@bot/navigation/core/menu';
import { BaseMenu } from '@bot/navigation/core/menu/base.menu';
import { getAppLink } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { initialSession } from '@session/session.model';

@Injectable()
export class SubscriptionMenu extends BaseMenu {
  menu = new Menu('subscription-menu');
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.menu
      .dynamic(async (ctx, range) => {
        console.log('URL');
        const url = getAppLink(ctx.session.selectedDevice);
        range.url('🔽Скачать', url);
      })
      .dynamic(async (ctx, range) => {
        const redirectUrl = ctx.session.redirectUrl;
        if (redirectUrl) range.url('🔐 Подключиться', redirectUrl);
      })
      .text('🔄 Новая ссылка', async (ctx) => {
        await this.navigateTo(ctx,'revokeSub');
      })
      .row()
      .text('Главное меню', async (ctx) => {
        ctx.session = initialSession();
        await this.navigateTo(ctx,'main');
      });
  }

  create() {
    return this.menu;
  }
}
