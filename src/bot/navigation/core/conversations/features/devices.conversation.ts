import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { Menu } from '@bot/navigation/core/menu';
import { getDevicesPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class DevicesConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(ctx: BotContext, menu: Menu) {
    await this.render(ctx, getDevicesPageContent(), menu);
  }
}
