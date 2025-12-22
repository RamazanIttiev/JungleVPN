import { BotContext, ClientApp, initialSession, SessionData } from '@bot/bot.types';
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
    const tgUser = this.validateUser(ctx.from);
    const locale = tgUser.language_code;

    ctx.session.user = initialSession().user;
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    this.setClientApp(ctx.session, user?.subscriptionUrl);

    if (!user) {
      return await this.remnaService.createUser({
        telegramId: tgUser.id,
        username: tgUser.id.toString(),
        description: locale,
      });
    } else {
      if (user.description !== locale) {
        await this.remnaService.updateUser({
          uuid: user.uuid,
          description: locale,
        });
      }

      return user;
    }
  }

  setClientApp(session: SessionData, subUrl: string | undefined) {
    if (!subUrl) {
      return;
    }

    session.clientApp = [];

    const v2raytunClientApp: ClientApp = {
      name: 'v2raytun',
      url: `${process.env.V2RAYTUN_CLIENT_APP_URL}/${subUrl}`,
      appUrl: process.env.V2RAYTUN_APP_URL || '',
      platforms: ['android', 'ios', 'macOS', 'windows'],
    };

    const happClientApp: ClientApp = {
      name: 'happ',
      url: `${process.env.HAPP_CLIENT_APP_URL}/${subUrl}`,
      appUrl: process.env.HAPP_APP_URL || '',
      platforms: ['windows'],
    };

    session.clientApp?.push(v2raytunClientApp);
    session.clientApp?.push(happClientApp);
  }
}
