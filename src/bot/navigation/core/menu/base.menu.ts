import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { RouterLocation } from '@bot/navigation/core/conversations/conversations.types';
import { Menu } from '@bot/navigation/core/menu';
import { RemnaService } from '@remna/remna.service';

export abstract class BaseMenu {
  protected readonly menu: Menu;
  protected readonly botService: BotService;
  protected readonly remnaService: RemnaService;

  constructor(botService: BotService, remnaService: RemnaService) {
    this.botService = botService;
    this.remnaService = remnaService;
  }

  abstract create(menu?: Menu): Menu;

  protected async loadUser(ctx: BotContext) {
    const tgUser = this.botService.validateUser(ctx.from);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    return { tgUser, user };
  }

  protected async navigateTo(ctx: BotContext, to: RouterLocation) {
    await ctx.conversation.enter(to);
  }
}
