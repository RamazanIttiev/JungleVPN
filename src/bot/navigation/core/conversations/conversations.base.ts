import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { RouterLocation } from '@bot/navigation/core/conversations/conversations.types';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

export type MyConversation = Conversation<BotContext>;

@Injectable()
export abstract class Base {
  protected readonly botService: BotService;
  protected readonly remnaService: RemnaService;

  constructor(botService: BotService, remnaService: RemnaService) {
    this.botService = botService;
    this.remnaService = remnaService;
  }

  protected async render(ctx: Context, text: string, replyMarkup: any) {
    try {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: replyMarkup,
      });
    } catch {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: replyMarkup,
      });
    }
  }

  protected async loadUser(ctx: Context) {
    const tgUser = this.botService.validateUser(ctx.from);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    const username = tgUser.first_name ?? tgUser.username ?? 'User';

    return { tgUser, user, username };
  }

  protected isExpired(expireAt?: string) {
    if (!expireAt) return true;
    return Date.now() > new Date(expireAt).getTime();
  }

  protected buildUrls(subUrl?: string) {
    if (!subUrl) return { redirectUrl: '', appUrl: '' };
    return {
      appUrl: `https://apps.thejungle.pro/${subUrl}`,
      redirectUrl: `https://in.thejungle.pro/redirect?link=v2raytun://import/${subUrl}`,
    };
  }

  protected buildSubscriptionMenu(
    conversation: MyConversation,
    appUrl: string,
    redirectUrl: string,
  ) {
    return conversation
      .menu('subscription-menu')
      .url('🔽 Скачать', appUrl)
      .url('🔐 Подключиться', redirectUrl)
      .row()
      .text('🔄 Новая ссылка')
      .row()
      .text('Главное меню');
  }

  protected async navigateTo(ctx: BotContext, to: RouterLocation) {
    await ctx.conversation.enter(to);
  }

  protected async stop(conversation: MyConversation) {
    await conversation.halt();
  }
}
