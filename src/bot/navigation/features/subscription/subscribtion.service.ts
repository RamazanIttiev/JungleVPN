import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Menu } from '@bot/navigation';
import { Base } from '@bot/navigation/menu.base';
import { getSubscriptionPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class SubscriptionMsgService extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(ctx: BotContext, menu: Menu) {
    const session = ctx.session;

    const text = getSubscriptionPageContent({
      device: session.selectedDevice,
      subUrl: session.user.subscriptionUrl,
    });
    await this.render(ctx, text, menu);
  }
}
