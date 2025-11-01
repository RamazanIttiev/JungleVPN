import { BotService } from '@bot/bot.service';
import { Menu } from '@bot/navigation/core/menu';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { SessionFlavor } from '@session/session.model';
import { UsersService } from '@users/users.service';
import { Context } from 'grammy';

export type BotContext = ConversationFlavor<
  Context &
    SessionFlavor & {
      services: {
        bot: BotService;
        users: UsersService;
        payments: PaymentsService;
        remna: RemnaService;
      };
    }
>;

export type ConversationContext = Context &
  SessionFlavor & {
    services: {
      bot: BotService;
      users: UsersService;
      payments: PaymentsService;
      remna: RemnaService;
    };
  };
type NameConversation = Conversation<BotContext, Context>;

// export interface BotContext extends ConversationFlavor<Context>, SessionFlavor {
//   services: {
//     bot: BotService;
//     users: UsersService;
//     payments: PaymentsService;
//     remna: RemnaService;
//   };
// }

export type MenuContext = Menu;
