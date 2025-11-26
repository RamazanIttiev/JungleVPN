import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { User as GrammyUser } from '@grammyjs/types/manage';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';

@Injectable()
export class UserService {
  constructor(private remnaService: RemnaService) {}

  private validateUser(user: GrammyUser | undefined) {
    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }

  private setUserToSession(ctx: BotContext, user: UserDto) {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);

    session.redirectUrl = `${process.env.CLIENT_APP_URL}/${user.subscriptionUrl}`;

    session.user = {
      uuid: user.uuid,
      telegramId: user.telegramId,
      username: tgUser.username,
      expireAt: user.expireAt,
      subscriptionUrl: user.subscriptionUrl,
    };
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);
    const locale = tgUser.language_code || process.env.DEFAULT_LOCALE || 'ru';

    if (!session.user.uuid) {
      const user = await this.remnaService.getUserByTgId(tgUser.id);

      if (!user) {
        const newUser = await this.remnaService.createUser({
          telegramId: tgUser.id,
          username: tgUser.id.toString(),
          description: locale,
        });

        session.redirectUrl = `${process.env.CLIENT_APP_URL}/${newUser.subscriptionUrl}`;

        this.setUserToSession(ctx, newUser);
      } else {
        if (user.description !== locale) {
          await this.remnaService.updateUser({
            uuid: user.uuid,
            description: locale,
          });
        }
        this.setUserToSession(ctx, user);
      }
    }
  }
}
