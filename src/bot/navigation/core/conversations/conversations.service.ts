import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { Base } from '@bot/navigation/core/conversations/conversations.base';
import {
  getAppLink,
  getDevicesPageContent,
  getMainPageContent,
  getNewUserMainPageContent,
  getPaymentPageContent,
  getPaymentPeriodsPage,
  getSubscriptionPageContent,
} from '@bot/utils/templates';
import { escapeHtml } from '@bot/utils/utils';
import { Conversation } from '@grammyjs/conversations';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { initialSession } from '@session/session.model';
import { Context } from 'grammy';

type MyConversation = Conversation<BotContext>;

@Injectable()
export class ConversationService extends Base {
  constructor(
    readonly botService: BotService,
    readonly remnaService: RemnaService,
    readonly paymentService: PaymentsService,
  ) {
    super(botService, remnaService);
  }
  async main(conversation: MyConversation, ctx: Context) {
    const menu = conversation.menu('main-menu').text('Подключиться 📶').text('Продлить подписку');

    const { user, username } = await conversation.external((ctx) => this.loadUser(ctx));
    const isExpired = this.isExpired(user?.expireAt);

    const content = !user
      ? getNewUserMainPageContent({ username, isExpired, isNewUser: true })
      : getMainPageContent({ username, isExpired, validUntil: user?.expireAt });

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }

  async devices(conversation: MyConversation, ctx: Context) {
    const devicesMenu = conversation
      .menu('devices-menu')
      .text('🍏 IOS')
      .text('🤖 Android')
      .row()
      .text('💻 MacOS')
      .text('🖥 Windows')
      .row()
      .back('⬅ Назад');

    await this.render(ctx, getDevicesPageContent(), devicesMenu);
    await this.stop(conversation);
  }

  async subscription(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);
    const { redirectUrl } = this.buildUrls(session.subUrl);
    const menu = this.buildSubscriptionMenu(
      conversation,
      getAppLink(session.selectedDevice),
      redirectUrl,
    );

    const text = getSubscriptionPageContent({
      device: session.selectedDevice,
      subUrl: session.subUrl,
    });

    await this.render(ctx, text, menu);
    await this.stop(conversation);
  }

  async clientApp(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);
    const { appUrl, redirectUrl } = this.buildUrls(session.subUrl);
    const menu = this.buildSubscriptionMenu(conversation, appUrl, redirectUrl);

    await ctx.editMessageReplyMarkup({ reply_markup: menu });
  }

  async revokeSub(conversation: MyConversation, ctx: Context) {
    const { user } = await this.loadUser(ctx);
    if (!user) return;

    const subUrl = await this.remnaService.revokeSub(user.uuid);
    const session = await conversation.external(async (ctx: BotContext) => {
      ctx.session.subUrl = subUrl;
      ctx.session.redirectUrl = `https://in.thejungle.pro/redirect?link=v2raytun://import/${subUrl}`;
      return ctx.session;
    });

    const { appUrl, redirectUrl } = this.buildUrls(session.subUrl);
    const menu = this.buildSubscriptionMenu(conversation, appUrl, redirectUrl);

    const content = getSubscriptionPageContent({
      device: session.selectedDevice!,
      subUrl: escapeHtml(session.subUrl!),
    });

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }

  async payment(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);
    const { paymentUrl, paymentId, selectedPeriod, selectedAmount } = session;

    if (!paymentUrl || !paymentId) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      await this.stop(conversation);
      return;
    }

    const menu = conversation
      .menu('payment-menu')
      .url('💳 Оплатить подписку', paymentUrl)
      .text('Я оплатил ✅');

    const content = getPaymentPageContent(selectedPeriod!, selectedAmount!);

    await this.render(ctx, content, menu);
    await this.stop(conversation);
  }

  async paymentStatus(conversation: MyConversation, ctx: Context) {
    const session = await conversation.external((ctx) => ctx.session);
    const { paymentId, paymentUrl } = session;
    console.log(session);
    if (!paymentUrl) {
      await ctx.reply('❗ Что-то пошло не так. Попробуй снова /start');
      await this.stop(conversation);
      return;
    }

    if (!paymentId) {
      await ctx.reply('❗ Платеж не найден. Попробуй заново /start');
      await this.stop(conversation);
      return;
    }

    const status = await conversation.external(() =>
      this.paymentService.checkPaymentStatus(paymentId),
    );

    if (status === 'succeeded') {
      await this.paymentService.updatePayment(paymentId, { status, paidAt: new Date() });

      await conversation.external((ctx) => {
        ctx.session = initialSession();
      });

      await conversation.external(async (ctx) => {
        await ctx.reply('✅ Оплата прошла успешно!');
        await ctx.conversation.enter('devices');
      });
    } else {
      await ctx.reply('❗ Платеж еще не оплачен.');
    }

    await this.stop(conversation);
  }

  async paymentPeriods(conversation: MyConversation, ctx: Context) {
    const menu = conversation
      .menu('paymentPeriods-menu')
      .text('1 месяц (199 ₽)')
      .row()
      .text('3 месяца (599 ₽)')
      .row()
      .text('6 месяцев (999 ₽)')
      .row()
      .back('⬅ Назад');

    const content = getPaymentPeriodsPage();

    await this.render(ctx, content, menu);
  }
}
