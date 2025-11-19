import * as process from 'node:process';
import { BotContext, initialSession } from '@bot/bot.types';
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

  async init(ctx: BotContext): Promise<UserDto> {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);

    ctx.session.user = initialSession().user;
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    if (!user) {
      console.log('NOUSER');

      const newUser = await this.remnaService.createUser({
        telegramId: tgUser.id,
        username: tgUser.id.toString(),
      });

      session.redirectUrl = `${process.env.CLIENT_APP_URL}/${newUser.subscriptionUrl}`;
      return newUser;
    } else {
      session.redirectUrl = `${process.env.CLIENT_APP_URL}/${user.subscriptionUrl}`;
      return user;
    }
  }
}
