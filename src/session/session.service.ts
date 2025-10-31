import { BotContext } from '@bot/bot.types';
import { Injectable } from '@nestjs/common';
import { SessionData } from '@session/session.model';

interface ISessionService {
  getSessionKey: (ctx: BotContext, key: keyof SessionData) => Promise<unknown>;
  updateSession: (ctx: BotContext, session: Partial<SessionData>) => Promise<void>;
}

@Injectable()
export class SessionService implements ISessionService {
  async getSessionKey(ctx: BotContext, key: keyof SessionData) {
    return ctx.session[key];
  }

  async updateSession(ctx: BotContext, data: Partial<SessionData>) {
    ctx.session = {
      ...ctx.session,
      ...data,
    };
  }
}
