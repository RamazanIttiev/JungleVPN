import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { getAppUrl } from '@utils/utils';

// TODO add happ client app link
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
      .url(
        (ctx) => ctx.t('download-button-label'),
        (ctx) => {
          const link = getAppUrl(ctx.session.selectedDevice);
          return link || 'https://example.com/fallback';
        },
      )
      .url(
        (ctx) => ctx.t('add-link-button-label'),
        (ctx) => {
          const link = ctx.session.redirectUrl;
          return link || 'https://example.com';
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('home-button-label'),
        async (ctx) => {
          await this.mainMsgService.init(ctx, this.mainMenu.menu);
        },
      );
  }
}
