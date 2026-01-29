import { BotContext, ClientApp, initialSession, SessionData } from '@bot/bot.types';
import { getRedirectUrl } from '@bot/utils/utils';
import { User as GrammyUser } from '@grammyjs/types/manage';
import { Injectable } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service';
import { UpdateUserRequestDto, UserDto } from '@user/user.model';

@Injectable()
export class UserService {
  constructor(private remnaService: RemnaService) {}

  validateUser(user: GrammyUser | undefined) {
    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }

  async getUserByTgId(id: number): Promise<UserDto | null> {
    return await this.remnaService.getUserByTgId(id);
  }

  async createUser(telegramId: number, locale?: string | undefined): Promise<UserDto> {
    return await this.remnaService.createUser({
      telegramId,
      username: telegramId.toString(),
      description: locale,
    });
  }

  async updateUser(body: UpdateUserRequestDto) {
    await this.remnaService.updateUser(body);
  }

  async init(ctx: BotContext): Promise<UserDto> {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);
    const locale = tgUser.language_code;

    session.user = initialSession().user;
    const user = await this.remnaService.getUserByTgId(tgUser.id);

    if (!user) {
      const newUser = await this.createUser(tgUser.id, locale);

      session.redirectUrl = getRedirectUrl(session.selectedDevice, newUser.subscriptionUrl);
      return newUser;
    } else {
      if (user.description !== locale) {
        await this.remnaService.updateUser({
          uuid: user.uuid,
          description: locale,
        });
      }

      session.redirectUrl = getRedirectUrl(session.selectedDevice, user.subscriptionUrl);
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
