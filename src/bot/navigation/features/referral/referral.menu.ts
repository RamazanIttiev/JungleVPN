import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMsgService } from '@bot/navigation/features/main/main.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ReferralMenu extends Base {
  readonly menu = new Menu('referral-menu');

  constructor(
    readonly mainMsgService: MainMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
  ) {
    super();

    this.menu.switchInline('Пригласить').text('Главное меню 🏠', async (cxt) => {
      await this.mainMsgService.init(cxt, this.mainMenu.menu);
    });
  }
}
