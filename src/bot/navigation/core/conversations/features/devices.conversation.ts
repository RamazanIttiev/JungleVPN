import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import { getDevicesPageContent } from '@bot/utils/templates';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class DevicesConversation extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
  ) {
    super(botService, remnaService);
  }

  async init(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);

    const devicesMenu = conversation
      .menu('devices-menu')
      .text('🍏 IOS')
      .text('🤖 Android')
      .row()
      .text('💻 MacOS')
      .text('🖥 Windows')
      .row()
      .back('⬅ Назад');

    const { user, tgUser } = await this.loadUser(ctx);

    if (!user)
      await this.remnaService.createUser({
        username: tgUser.username || tgUser.first_name,
        telegramId: tgUser.id,
        expireAt: '0',
        status: 'ACTIVE',
      });

    session.subUrl = user?.subscriptionUrl;
    session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${user?.subscriptionUrl}`;

    await conversation.external((ctx) => {
      ctx.session = session;
    });

    await this.render(ctx, getDevicesPageContent(), devicesMenu);
    await this.stop(conversation);
  }
}
