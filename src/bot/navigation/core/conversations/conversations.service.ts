import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import {
  getAppLink,
  getDevicesPageContent,
  getMainPageContent,
  getNewUserMainPageContent,
  getSubscriptionPageContent,
} from '@bot/utils/templates';
import { escapeHtml } from '@bot/utils/utils';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class ConversationService {
  constructor(
    private readonly botService: BotService,
    private readonly remnaService: RemnaService,
  ) {}

  async main(conversation: MyConversation, ctx: Context) {
    const mainMenuClone = conversation.menu('main-menu').text('Подключиться 📶');

    const { tgUser, user } = await conversation.external(async (ctx) => await this.loadUser(ctx));

    const isExpired = user ? Date.now().toString() > user?.expireAt : false;

    const username = tgUser.first_name ?? tgUser.username ?? 'User';

    const content = !user
      ? getNewUserMainPageContent({ username, isExpired, isNewUser: true })
      : getMainPageContent({
          username,
          isExpired,
          validUntil: user?.expireAt,
        });

    try {
      await ctx.editMessageText(content, {
        reply_markup: mainMenuClone,
        parse_mode: 'HTML',
      });
    } catch (error) {
      await ctx.reply(content, {
        reply_markup: mainMenuClone,
        parse_mode: 'HTML',
      });
    }

    await conversation.halt();
  }

  async devices(conversation: MyConversation, ctx: Context) {
    const devicesMenuClone = conversation
      .menu('devices-menu')
      .text('ios')
      .text('android')
      .row()
      .text('macOS')
      .text('windows')
      .row()
      .back('Назад');

    await ctx.editMessageText(getDevicesPageContent(), {
      reply_markup: devicesMenuClone,
      parse_mode: 'HTML',
    });

    await conversation.halt();
  }

  async subscription(conversation: MyConversation, ctx: Context) {
    const { redirectUrl, appUrl } = await conversation.external(async (ctx: BotContext) => {
      return {
        appUrl: getAppLink(ctx.session.selectedDevice),
        redirectUrl: ctx.session.redirectUrl || '',
      };
    });

    const subscriptionMenuClone = conversation
      .menu('subscription-menu')
      .url('🔽Скачать', appUrl)
      .url('🔐 Подключиться', redirectUrl)
      .text('🔄 Новая ссылка')
      .row()
      .text('Главное меню');

    const session = await conversation.external(async (ctx: BotContext) => {
      return ctx.session;
    });

    await ctx.editMessageText(
      getSubscriptionPageContent({
        device: session.selectedDevice,
        subUrl: session.subUrl,
      }),
      {
        reply_markup: subscriptionMenuClone,
        link_preview_options: { is_disabled: true },
        parse_mode: 'HTML',
      },
    );

    await conversation.halt();
  }

  async clientApp(conversation: MyConversation, ctx: Context) {
    const { redirectUrl, appUrl } = await conversation.external(async (ctx: BotContext) => {
      return {
        appUrl: getAppLink(ctx.session.selectedDevice),
        redirectUrl: ctx.session.redirectUrl || '',
      };
    });

    const subscriptionMenuClone = conversation
      .menu('subscription-menu')
      .url('🔽Скачать', appUrl)
      .url('🔐 Подключиться', redirectUrl)
      .text('🔄 Новая ссылка')
      .row()
      .text('Главное меню');

    await ctx.editMessageReplyMarkup({ reply_markup: subscriptionMenuClone });
  }

  async revokeSub(conversation: MyConversation, ctx: Context) {
    const { redirectUrl, appUrl } = await conversation.external(async (ctx: BotContext) => {
      return {
        appUrl: getAppLink(ctx.session.selectedDevice),
        redirectUrl: ctx.session.redirectUrl || '',
      };
    });

    const subscriptionMenuClone = conversation
      .menu('subscription-menu')
      .url('🔽Скачать', appUrl)
      .url('🔐 Подключиться', redirectUrl)
      .text('🔄 Новая ссылка')
      .row()
      .text('Главное меню');

    const { user } = await this.loadUser(ctx);

    const subUrl = await this.remnaService.revokeSub(user?.uuid!);

    const session = await conversation.external(async (ctx: BotContext) => {
      ctx.session.subUrl = subUrl;
      ctx.session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${subUrl}`;
      return ctx.session;
    });

    const content = getSubscriptionPageContent({
      device: session.selectedDevice!,
      subUrl: escapeHtml(session.subUrl!),
    });

    const editMessage = async () => {
      await ctx.editMessageText(content, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: subscriptionMenuClone,
      });
    };

    try {
      await ctx.deleteMessage();
    } catch (error) {
      await editMessage();
      console.error('Failed to delete message:', error);
    }

    await ctx.reply(content, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: subscriptionMenuClone,
    });

    await conversation.halt();
  }

  private async loadUser(ctx: Context) {
    const tgUser = this.botService.validateUser(ctx.from!);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    return { tgUser, user };
  }
}
