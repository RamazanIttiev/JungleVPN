import { BotContext, initialSession } from '@bot/bot.types';
import { getRedirectUrl } from '@bot/utils/utils';
import { User as GrammyUser } from '@grammyjs/types/manage';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ReferralService } from '@referral/referral.service';
import { RemnaService } from '@remna/remna.service';
import { UpdateUserRequestDto, UserDto } from '@user/user.model';
import { GrammyError } from 'grammy';

@Injectable()
export class UserService {
  constructor(
    private remnaService: RemnaService,
    @Inject(forwardRef(() => ReferralService))
    private referralService: ReferralService,
  ) {}

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
      session.subscriptionUrl = newUser.subscriptionUrl;
      return newUser;
    } else {
      if (user.description !== locale) {
        await this.remnaService.updateUser({
          uuid: user.uuid,
          description: locale,
        });
      }

      session.redirectUrl = getRedirectUrl(session.selectedDevice, user.subscriptionUrl);
      session.subscriptionUrl = user.subscriptionUrl;
      return user;
    }
  }

  async handleInvalidUserRemoval(user: UserDto, error: string | GrammyError): Promise<boolean> {
    const errorMessage =
      typeof error === 'string' ? error : error?.description || error?.message;

    const isBlocked =
      errorMessage.includes('Forbidden: bot was blocked by the user') ||
      errorMessage.includes('Bad Request: chat not found');

    if (isBlocked && !user.userTraffic.firstConnectedAt) {
      await this.deleteUser(user.uuid);
      await this.referralService.deleteUser(user.telegramId || 0);
      return true;
    }

    return false;
  }

  async deleteUser(uuid: string) {
    await this.remnaService.deleteUser(uuid);
  }
}
