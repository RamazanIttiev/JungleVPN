import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { getNewUserMainPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class MainNewUserConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(ctx: BotContext, menu: Menu) {
    const tgUser = this.botService.validateUser(ctx.from);
    const username = tgUser.first_name ?? tgUser.username;

    const content = getNewUserMainPageContent({ username });

    await this.render(ctx, content, menu);
  }
}
