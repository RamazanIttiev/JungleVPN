import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { User } from '@remna/remna.model';
import { RemnaService } from '@remna/remna.service';

@Injectable()
export class UserService {
  constructor(
    private botService: BotService,
    private remnaService: RemnaService,
  ) {}

  private setUserToSession(ctx: BotContext, user: User) {
    const session = ctx.session;
    const tgUser = this.botService.validateUser(ctx.from);
    const username = tgUser.first_name ?? tgUser.username;

    session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${user.subscriptionUrl}`;

    session.user = {
      uuid: user.uuid,
      telegramId: user.telegramId,
      username,
      expireAt: user.expireAt,
      subscriptionUrl: user.subscriptionUrl,
    };
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const tgUser = this.botService.validateUser(ctx.from);
    const username = tgUser.first_name ?? tgUser.username;

    const user = await this.remnaService.getUserByTgId(tgUser.id);

    if (!user) {
      const newUser = await this.remnaService.createUser({
        username,
        telegramId: tgUser.id,
      });

      session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${newUser.subscriptionUrl}`;

      this.setUserToSession(ctx, newUser);
    } else {
      this.setUserToSession(ctx, user);
    }
  }
}
