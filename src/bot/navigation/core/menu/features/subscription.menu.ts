import { BotService } from '@bot/bot.service';
import { initialSession } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { getAppLink } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class SubscriptionMenu extends Base {
  menu = new Menu('subscription-menu');
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);

    this.menu
      .url('🔽Скачать', (ctx) => getAppLink(ctx.session.selectedDevice))
      .url('🔐 Подключиться', (ctx) => ctx.session.redirectUrl!)
      .row()
      .text('🔄 Новая ссылка', async (ctx) => {
        await this.navigateTo(ctx, 'revokeSub');
      })
      .row()
      .text('Главное меню', async (ctx) => {
        ctx.session = {
          ...initialSession(),
          user: ctx.session.user,
        };
        await this.navigateTo(ctx, 'main');
      });
  }

  create() {
    return this.menu;
  }
}
