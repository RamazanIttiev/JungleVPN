import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InlineKeyboard } from 'grammy';

@Injectable()
export class ProfileMenu extends Base {
  readonly menu = new Menu('profile-menu');

  constructor(
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    @Inject(forwardRef(() => MainMsgService))
    readonly mainMsgService: MainMsgService,
  ) {
    super();

    this.menu.dynamic(async (ctx, range) => {
      const keyboard = new InlineKeyboard();

      if (!ctx.session.hasActiveSubscription) {
        range.text(
          (ctx) => ctx.t('subscription-button-label'),
          async (ctx) => {
            await this.render(
              ctx,
              ctx.t('no-active-subscription-text'),
              keyboard.text(ctx.t('home-button-label'), 'navigate_main'),
              true,
            );
          },
        );
      } else {
        range.url(
          (ctx) => ctx.t('subscription-button-label'),
          async (ctx) => {
            return ctx.session.billingPortalUrl || 'https://example.com';
          },
        );
      }
    });
  }
}
