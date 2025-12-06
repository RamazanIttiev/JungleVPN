import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileMenu extends Base {
  readonly menu = new Menu('profile-menu');

  constructor() {
    super();

    this.menu.text((ctx) => ctx.t('subscription-button-label'));
  }
}
