import { BotService } from '@bot/bot.service';
import { Menu } from '@grammyjs/menu';
import { PaymentsService } from '@payments/payments.service';
import { SessionFlavor } from '@session/session.model';
import { UsersService } from '@users/users.service';
import { XuiService } from '@xui/xui.service';
import { Context } from 'grammy';

export interface BotContext extends Context, SessionFlavor {
  services: {
    bot: BotService;
    xui: XuiService;
    users: UsersService;
    payments: PaymentsService;
  };
}

export type MenuContext = Menu<BotContext>;
