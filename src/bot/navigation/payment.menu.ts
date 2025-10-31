import { Menu } from '@bot/navigation/core/menu';
import { getDevicesPageContent } from '@bot/utils/templates';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { initialSession } from '@session/session.model';

@Injectable()
export class PaymentMenu {
  menu = new Menu('payment-menu');
  constructor(private readonly paymentsService: PaymentsService) {}

  create() {
    this.menu.dynamic(async (ctx, range) => {
      const paymentUrl = ctx.session.paymentUrl;
      if (paymentUrl) {
        range.url('💳 Оплатить подписку', paymentUrl);
      }
    });

    this.menu
      .text('Я оплатил ✅', async (ctx) => {
        const paymentId = ctx.session.paymentId;

        if (!paymentId) {
          await ctx.reply('Это кажется старое сообщение');
          return;
        }

        const status = await this.paymentsService.checkPaymentStatus(paymentId);

        if (status === 'succeeded') {
          // await ctx.services.users.updateExpiryTime(tgUser.id, ctx.session.selectedPeriod!);
          await this.paymentsService.updatePayment(paymentId, { status, paidAt: new Date() });
          ctx.session = initialSession();

          await ctx.menu.nav('devices-menu');
          await ctx.editMessageText(getDevicesPageContent(), {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true },
          });
        } else {
          await ctx.reply('Платеж не найден или не оплачен. Уверен, что ты оплатил подписку?');
        }
      })
      .row();

    return this.menu;
  }
}
