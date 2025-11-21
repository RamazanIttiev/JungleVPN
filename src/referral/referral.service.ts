import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '@user/user.service';
import { add } from 'date-fns';
import { Repository } from 'typeorm';
import { Referral, ReferralStatus } from './referral.entity';
import { generateReferralCode } from './referral.utils';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getReferralRecord(id: number) {
    return await this.referralRepository.findOne({ where: { invitedId: id } });
  }

  async createReferralRecord(inviterId: number, invitedId: number) {
    const referral = this.referralRepository.create({
      inviterId,
      invitedId,
      status: ReferralStatus.FIRST_REWARD,
    });

    await this.referralRepository.save(referral);
  }

  async handleNewUser(ctx: BotContext, inviterId: number, invitedTelegramId: number) {
    if (inviterId === invitedTelegramId) {
      await ctx.reply(
        'Ты перешел по своей же реверальной ссылке. Ты не можешь пргласить самого себя 🥲. Нажми /start',
      );
      this.logger.warn(`User ${invitedTelegramId} tried to refer themselves.`);
      return null;
    }

    const existingUser = await this.userService.getUserByTgId(invitedTelegramId);

    if (existingUser) {
      this.logger.warn(`Invited user ${invitedTelegramId} is not new.`);
      return;
    }

    const inviter = await this.userService.getUserByTgId(inviterId);
    if (!inviter?.telegramId) {
      this.logger.warn(`Inviter ${inviterId} not found.`);
      return;
    }
    const invited = await this.userService.createUser(invitedTelegramId);
    if (!invited?.telegramId) {
      this.logger.warn(`Invited ${invitedTelegramId} not found.`);
      return;
    }

    await this.createReferralRecord(inviter.telegramId, invited.telegramId);
    await this.rewardUser(
      inviter.telegramId,
      Number(process.env.INVITER_START_BONUS_IN_DAYS),
      true,
    );
  }

  async handleInviterRewardAfterPayment(invitedTelegramId: number) {
    const invited = await this.userService.getUserByTgId(invitedTelegramId);
    if (!invited?.telegramId) {
      this.logger.warn(`Invited user ${invitedTelegramId} not found.`);
      return;
    }

    const referral = await this.referralRepository.findOne({
      where: { invitedId: invited.telegramId },
    });

    if (!referral) {
      this.logger.warn(`Referral user ${invitedTelegramId} not found in DB.`);
      return;
    }

    if (referral.status === ReferralStatus.COMPLETED) {
      this.logger.log(
        `Inviter ${referral.inviterId} received all bonuses for ${invitedTelegramId}`,
      );
      return;
    }

    await this.rewardUser(
      referral.inviterId,
      Number(process.env.INVITER_PAID_BONUS_IN_DAYS),
      false,
    );

    referral.status = ReferralStatus.COMPLETED;
    await this.referralRepository.save(referral);
  }

  private async rewardUser(inviterId: number, days: number, isNewUser: boolean) {
    const user = await this.userService.getUserByTgId(inviterId);
    if (!user) return;

    const newExpireAt = add(user.expireAt, {
      days,
    });

    await this.userService.updateUser({
      uuid: user.uuid,
      expireAt: newExpireAt.toISOString(),
    });

    this.eventEmitter.emit('user.rewarded', { id: user.telegramId, isNewUser });
    this.logger.log(`Rewarded inviter ${inviterId} with ${days} day(s)`);
  }

  getUserReferralLink(telegramId: number): string {
    const code = generateReferralCode(telegramId);
    return `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=ref_${code}`;
  }
}
