import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { getMainPageContent } from '@bot/utils/templates';
import { toDateString } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class MainService extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(ctx: BotContext, menu: Menu) {
    const session = ctx.session;
    const user = session.user;

    const isExpired = this.isExpired(user.expireAt);

    const content = getMainPageContent({
      username: user.username!,
      isExpired,
      validUntil: toDateString(user.expireAt!),
    });

    await this.render(ctx, content, menu);
  }
}
