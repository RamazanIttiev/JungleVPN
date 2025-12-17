import * as process from 'node:process';
import { Menu } from '@bot/navigation';
import { RevokeSubMenuService } from '@bot/navigation/features/subscription/revokeSub.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SupportMenu {
  menu = new Menu('support-menu');

  constructor(readonly revokeSubMenuService: RevokeSubMenuService) {
    this.menu
      .text(
        (ctx) => ctx.t('new-link-button-label'),
        async (ctx) => {
          await this.revokeSubMenuService.init(ctx);
        },
      )
      .row()
      .url(
        (ctx) => ctx.t('support-chanel-button-label'),
        process.env.SUPPORT_URL || 'https://t.me/JungleVPN_support',
      );
  }
}
