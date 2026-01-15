import { BotContext } from '@bot/bot.types';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';

@Injectable()
export class ProfileMenuService extends Base {
  constructor(
    @Inject(forwardRef(() => ProfileMenu))
    readonly profileMenu: ProfileMenu,
    readonly stripeProvider: StripeProvider,
  ) {
    super();
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const tgUser = ctx.from;
    if (!tgUser?.id) return;

    const customerId = await this.stripeProvider.getCustomerId(tgUser.id.toString());
    const hasActiveSubscription = customerId
      ? await this.stripeProvider.hasActiveSubscription(customerId)
      : false;

    if (hasActiveSubscription && customerId) {
      const { url } = await this.stripeProvider.createPortalSession(customerId);
      session.billingPortalUrl = url;
      session.hasActiveSubscription = true;
    }

    await this.render(ctx, ctx.t('profile-text'), this.profileMenu.menu);
  }
}
