import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { RouterLocation } from '@bot/navigation/core/conversations/conversations.types';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { User } from '@remna/remna.model';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

export type MyConversation = Conversation<BotContext>;

@Injectable()
export abstract class Base {
  protected readonly botService: BotService;
  protected readonly remnaService: RemnaService;

  protected constructor(botService: BotService, remnaService: RemnaService) {
    this.botService = botService;
    this.remnaService = remnaService;
  }

  protected async render(ctx: Context, text: string, reply_markup: any) {
    try {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup,
      });
    } catch {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup,
      });
    }
  }

  private isValidUsername(username: string): boolean {
    const regex = /^[A-Za-z0-9_-]+$/;
    return regex.test(username);
  }

  protected async loadUser(ctx: BotContext): Promise<Partial<User>> {
    const tgUser = this.botService.validateUser(ctx.from);
    const isValidUsername = this.isValidUsername(tgUser.username || tgUser.first_name);
    const username = isValidUsername ? `${tgUser.username}_${tgUser.id}` : `${tgUser.id}`;

    const user = ctx.session.user.telegramId
      ? ctx.session.user
      : await this.remnaService.getUserByTgId(tgUser.id);

    if (user) {
      ctx.session.user = user;
    }
    return {
      ...user,
      username,
    };
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
