import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { getAppLink } from '@utils/utils';

@Injectable()
export class SubscriptionMenu extends Base {
  menu = new Menu('subscription-menu');
  constructor(
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
  ) {
    super();

    this.menu
      .url('🔽 Скачать', (ctx) => {
        const link = getAppLink(ctx.session.selectedDevice);
        return link || 'https://example.com/fallback';
      })
      .url('🔗 Добавить профиль', (ctx) => {
        const link = ctx.session.redirectUrl;
        return link || 'https://example.com';
      })
      // .row()
      // .text('🔄 Новая ссылка', async (ctx) => {
      //   await this.revokeSubMsgService.init(ctx);
      // })
      .row()
      .text('Главное меню', async (ctx) => {
        await this.mainMsgService.init(ctx, this.mainMenu.menu);
      });
  }
}
