import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { getReferralPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReferralMsgService extends Base {
  async init(ctx: BotContext, menu: Menu, deleteOldMsg?: boolean) {
    const content = getReferralPageContent();

    await this.render(ctx, content, menu, deleteOldMsg);
  }
}
