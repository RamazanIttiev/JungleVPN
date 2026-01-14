import { BotContext } from '@bot/bot.types';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';

@Injectable()
export class ProfileMenuService extends Base {
  constructor(
    @Inject(forwardRef(() => ProfileMenu))
    readonly profileMenu: ProfileMenu,
    readonly paymentService: PaymentsService,
    readonly stripeProvider: StripeProvider,
  ) {
    super();
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const tgUser = ctx.from;
    if (!tgUser?.id) return;

    const payment = await this.paymentService.findOneByTelegramId(tgUser?.id);
    const hasActiveSubscription = payment?.stripeCustomerId
      ? await this.stripeProvider.hasActiveSubscription(payment?.stripeCustomerId)
      : false;

    if (hasActiveSubscription && payment?.stripeCustomerId) {
      const { url } = await this.stripeProvider.createPortalSession(payment.stripeCustomerId);
      session.billingPortalUrl = url;
      session.hasActiveSubscription = true;
    }

    await this.render(ctx, ctx.t('profile-text'), this.profileMenu.menu);
  }
}
