import { BotService } from '@bot/bot.service';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { getAppLink } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { initialSession } from '@session/session.model';

@Injectable()
export class SubscriptionMenu extends Base {
  menu = new Menu('subscription-menu');
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.menu
      .dynamic(async (ctx, range) => {
        const url = getAppLink(ctx.session.selectedDevice);
        range.url('🔽Скачать', url);
      })
      .dynamic(async (ctx, range) => {
        const redirectUrl = ctx.session.redirectUrl;
        if (redirectUrl) range.url('🔐 Подключиться', redirectUrl);
      })
      .row()
      .text('🔄 Новая ссылка', async (ctx) => {
        await this.navigateTo(ctx, 'revokeSub');
      })
      .row()
      .text('Главное меню', async (ctx) => {
        ctx.session = initialSession();
        await this.navigateTo(ctx, 'main');
      });
  }

  create() {
    return this.menu;
  }
}
