import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { getAppLink } from '@utils/utils';

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
          const link = getAppLink(ctx.session.selectedDevice);
          return link || 'https://example.com/fallback';
        },
      )
      .dynamic((ctx, range) => {
        const clientApps = ctx.session.clientApp;

        clientApps
          ?.filter((app) => {
            if (!app.platforms || app.platforms.length === 0) return true;
            return ctx.session.selectedDevice && app.platforms.includes(ctx.session.selectedDevice);
          })
          .map((app) => {
            return range.row().url(
              () => ctx.t(`add-${app.name}-profile-button-label`),
              () => {
                const url = app.url;
                return url || 'https://example.com/fallback';
              },
            );
          });
      })
      .row()
      .text(
        (ctx) => ctx.t('home-button-label'),
        async (ctx) => {
          await this.mainMsgService.init(ctx, this.mainMenu.menu);
        },
      );
  }
}
