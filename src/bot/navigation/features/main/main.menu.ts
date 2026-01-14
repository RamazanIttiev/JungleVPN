import * as process from 'node:process';
import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { ProfileMenuService } from '@bot/navigation/features/profile/profile-menu.service';
import { SupportMenu } from '@bot/navigation/features/support/support.menu';
import { ReferralMenu } from '@bot/navigation/features/referral/referral.menu';
import { ReferralMsgService } from '@bot/navigation/features/referral/referral.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MainMenu extends Base {
  readonly menu = new Menu('main-menu');

  constructor(
    @Inject(forwardRef(() => DevicesMenu))
    readonly devicesMenu: DevicesMenu,
    @Inject(forwardRef(() => PaymentsPeriodsMenu))
    readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
    @Inject(forwardRef(() => ProfileMenu))
    readonly profileMenu: ProfileMenu,
    readonly profileMenuService: ProfileMenuService,
    readonly supportMenu: SupportMenu,
    @Inject(forwardRef(() => ReferralMenu))
    readonly referralMenu: ReferralMenu,
    readonly referralMsgService: ReferralMsgService,
  ) {
    super();

    this.menu
      .text(
        (ctx) => ctx.t('connect-button-label'),
        async (ctx) => {
          await this.render(ctx, ctx.t('devices-text'), this.devicesMenu.menu);
        },
      )
      .text(
        (ctx) => ctx.t('extend-button-label'),
        async (ctx) => {
          await this.render(ctx, ctx.t('payment-periods-text'), this.paymentsPeriodsMenu.menu);
        },
      )
      .row()
      .text('Партнерка 🤝', async (ctx) => {
        await this.referralMsgService.init(ctx, this.referralMenu.menu);
      })
      .text(
        (ctx) => ctx.t('profile-button-label'),
        async (ctx) => await this.profileMenuService.init(ctx),
      )
      .row()
      .url(
        (ctx) => ctx.t('chanel-button-label'),
        process.env.TELEGRAM_CHANNEL_URL || 'https://t.me/in_the_jungle',
      )
      .row()
      .text(
        (ctx) => ctx.t('support-button-label'),
        async (ctx) => {
          await this.render(ctx, ctx.t('support-text'), this.supportMenu.menu);
        },
      );
  }
}
