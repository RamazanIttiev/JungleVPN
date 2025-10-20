import { BotContext, MenuContext } from '@bot/bot.model';
import {
  getConnectionPageContent,
  getDevicesPageContent,
  getMainPageContent,
  getNewUserMainPageContent,
  getPaymentPageContent,
  getPaymentPeriodsPage,
} from '@bot/methods/menu/content/templates';
import { PaymentAmount, PaymentPeriod } from '@payments/payments.model';
import { Context } from 'grammy';

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const goToDevicesPage = async (ctx: any) => {
  ctx.menu.nav('devices-menu');
  await ctx.editMessageText(getDevicesPageContent(), {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
};

export const goToPaymentPeriodsPage = async (ctx: any) => {
  ctx.menu.nav('payment-periods-menu');
  await ctx.editMessageText(getPaymentPeriodsPage(), {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
};

export const goToMainPage = async (ctx: any) => {
  const tgUser = ctx.services.bot.validateUser(ctx.from);

  const user = await ctx.services.users.getUser(tgUser.id);
  const username = tgUser.first_name || tgUser.username;
  const isExpired = await ctx.services.users.getIsUserExpired(tgUser.id);

  const content = !user
    ? getNewUserMainPageContent({ username, isExpired, isNewUser: !user })
    : getMainPageContent({
        username,
        isExpired,
        clients: user?.clients,
        validUntil: user?.expiryTime,
      });

  ctx.menu.nav('main-menu');
  await ctx.editMessageText(content, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
};

export const goToPaymentPage = async (
  ctx: Context,
  period: PaymentPeriod,
  amount: PaymentAmount,
  replyMenu: MenuContext,
) => {
  const content = getPaymentPageContent(period, amount)

  const editMessage = async () => {
    await ctx.editMessageText(content, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: replyMenu,
    });
  }

  try {
    await ctx.deleteMessage();
  } catch (error) {
    await editMessage()
    console.error('Failed to delete message:', error);
  }

  await ctx.reply(content, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: replyMenu,
  });
};

export const goToConnectionPage = async (ctx: BotContext, replyMenu: MenuContext) => {
  if (!ctx.session.selectedDevice) {
    throw new Error('No device. goToConnectionPage');
  }
  if (!ctx.session.subUrl) {
    throw new Error('No device. goToConnectionPage');
  }

  const content = getConnectionPageContent({
    device: ctx.session.selectedDevice,
    subUrl: escapeHtml(ctx.session.subUrl),
  });

  const editMessage = async () => {
    await ctx.editMessageText(content, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
      reply_markup: replyMenu,
    });
  }

  try {
    await ctx.deleteMessage();
  } catch (error) {
    await editMessage()
    console.error('Failed to delete message:', error);
  }

  await ctx.reply(content, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: replyMenu,
  });
};
