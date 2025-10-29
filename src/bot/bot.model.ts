import { BotService } from '@bot/bot.service';
import { Menu } from '@bot/navigation/menu';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { SessionFlavor } from '@session/session.model';
import { UsersService } from '@users/users.service';
import { Context } from 'grammy';

export interface BotContext extends Context, SessionFlavor {
  services: {
    bot: BotService;
    users: UsersService;
    payments: PaymentsService;
    remna: RemnaService;
  };
}

export type MenuContext = Menu;
