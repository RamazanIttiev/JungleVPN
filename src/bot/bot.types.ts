import { ConversationFlavor } from '@grammyjs/conversations';
import { SessionFlavor } from '@session/session.model';
import { Context } from 'grammy';

export type BotContext = ConversationFlavor<Context & SessionFlavor>;

export type ConversationContext = Context & SessionFlavor;
