import { BotContext } from '@bot/bot.model';
import {
  getConnectionPageContent,
  getDevicesPageContent,
  getPaymentPeriodsPage,
} from '@bot/methods/menu/content/templates';
import { Menu } from '@grammyjs/menu';
import { PaymentPeriod } from '@payments/payments.model';
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

export const goToMainMenu = async (ctx: any) => {
  const username = ctx.from?.first_name || ctx.from?.username;
  console.log(ctx.session);
  ctx.menu.nav('main-menu');
  // await ctx.editMessageText(
  //   getMainPageContent({ username, validUntil: new Date().toISOString(), clients: [] }),
  //   {
  //     parse_mode: 'HTML',
  //     link_preview_options: { is_disabled: true },
  //   },
  // );
};

export const goToPaymentPage = async (
  ctx: Context,
  period: PaymentPeriod,
  amount: string,
  replyMenu: Menu<BotContext>,
) => {
  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error('Failed to delete message:', error);
  }

  await ctx.reply(`${period} - ${amount}`, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: replyMenu,
  });
};

export const goToConnectionPage = async (ctx: BotContext, replyMenu: Menu<BotContext>) => {
  if (!ctx.session.selectedDevice) {
    throw new Error('No device. goToConnectionPage');
  }

  const content = getConnectionPageContent({
    device: ctx.session.selectedDevice,
    subUrl: escapeHtml(''),
  });

  try {
    await ctx.deleteMessage();
  } catch (error) {
    console.error('Failed to delete message:', error);
  }

  await ctx.reply(content, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: replyMenu,
  });
};
