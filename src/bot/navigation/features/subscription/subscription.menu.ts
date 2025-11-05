import { BotService } from '@bot/bot.service';
import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { RevokeSubMsgService } from '@bot/navigation/features/subscription/revokeSub.service';
import { Base } from '@bot/navigation/menu.base';
import { getAppLink } from '@bot/utils/templates';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class SubscriptionMenu extends Base {
  menu = new Menu('subscription-menu');
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => RevokeSubMsgService))
    readonly revokeSubMsgService: RevokeSubMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
  ) {
    super(botService, remnaService);

    this.menu
      .url('🔽 Скачать', (ctx) => {
        const link = getAppLink(ctx.session.selectedDevice);
        return link || 'https://example.com/fallback';
      })
      .url('🔐 Подключиться', (ctx) => {
        const link = ctx.session.redirectUrl;
        return link || 'https://example.com';
      })
      .row()
      .text('🔄 Новая ссылка', async (ctx) => {
        await this.revokeSubMsgService.init(ctx);
      })
      .row()
      .text('Главное меню', async (ctx) => {
        ctx.session = {
          ...ctx.session,
          user: ctx.session.user,
        };
        await this.mainMsgService.init(ctx, this.mainMenu.menu);
      });
  }
}
