import { User as GrammyUser } from '@grammyjs/types/manage';
import { Injectable } from '@nestjs/common';
import { Context } from 'grammy';

@Injectable()
export abstract class Base {
  protected async render(ctx: Context, text: string, reply_markup: any) {
    try {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup,
      });
    } catch (error) {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup,
      });
    }
  }

  protected isExpired(expireAt?: string) {
    if (!expireAt) return true;
    return Date.now() > new Date(expireAt).getTime();
  }

  protected validateUser(user: GrammyUser | undefined) {
    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }
}
