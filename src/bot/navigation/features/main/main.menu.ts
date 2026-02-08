import * as process from 'node:process';
import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { DonateMenu } from '@bot/navigation/features/donation/donate.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { ReferralMenu } from '@bot/navigation/features/referral/referral.menu';
import { SupportMenu } from '@bot/navigation/features/support/support.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';

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
    readonly supportMenu: SupportMenu,
    @Inject(forwardRef(() => ReferralMenu))
    readonly referralMenu: ReferralMenu,
    readonly donateMenu: DonateMenu,
    readonly userService: UserService,
  ) {
    super();

    this.menu
      .text(
        (ctx) => ctx.t('donate-button-label'),
        async (ctx) => {
          await this.render(ctx, ctx.t('donate-text'), this.donateMenu.menu);
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('connect-button-label'),
        async (ctx) => {
          await this.render(ctx, ctx.t('devices-text'), this.devicesMenu.menu);
        },
      )
      .text(
        (ctx) => ctx.t('available-countries-button-label'),
        async (ctx) => {
          await this.render(ctx, ctx.t('available-countries-text'), this.profileMenu.menu);
        },
      )
      // .text(
      //   (ctx) => ctx.t('referra-button-label'),
      //   async (ctx) => {
      //     await this.referralMenuService.init(ctx, this.referralMenu.menu);
      //   },
      // )
      // .text(
      //   (ctx) => ctx.t('profile-button-label'),
      //   async (ctx) => await this.profileMenuService.init(ctx),
      // )
      .row()
      .url(
        (ctx) => ctx.t('chanel-button-label'),
        process.env.TELEGRAM_CHANNEL_URL || 'https://t.me/in_the_jungle',
      )
      .dynamic(async (ctx, range) => {
        const tgUser = this.validateUser(ctx.from);

        const user = await this.userService.getUserByTgId(tgUser.id);

        if (user) {
          range.text(
            (ctx) => ctx.t('support-button-label'),
            async (ctx) => {
              await this.render(ctx, ctx.t('support-text'), this.supportMenu.menu);
            },
          );
        }
      });
  }
}
