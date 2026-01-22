import * as process from 'node:process';
import { BotContext } from '@bot/bot.types';
import { Broadcast } from '@bot/commands/broadcast/entities/broadcast.entity';
import { BroadcastMessage } from '@bot/commands/broadcast/entities/broadcast-message.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemnaService } from '@remna/remna.service';
import { mockBroadcastUserDto, UserDto } from '@user/user.model';
import { safeEditMessage, safeSendMessage } from '@utils/utils';
import { Bot } from 'grammy';
import { Repository } from 'typeorm';

@Injectable()
export class BroadcastCommand {
  logger = new Logger('BroadcastCommand');
  private readonly BATCH_SIZE = 25;
  private readonly DELAY_MS = 1050;
  private successCount = 0;
  private failureCount = 0;
  private errorMessages: string[] = [];

  constructor(
    readonly remnaService: RemnaService,
    @InjectRepository(Broadcast)
    private broadcastRepo: Repository<Broadcast>,
    @InjectRepository(BroadcastMessage)
    private broadcastMessageRepo: Repository<BroadcastMessage>,
  ) {}

  private async processBatch<T>(
    items: T[],
    processItem: (item: T) => Promise<void>,
    batchLabel: string,
  ) {
    const totalItems = items.length;

    for (let i = 0; i < totalItems; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE);

      const promises = batch.map(async (item) => {
        try {
          await processItem(item);
          this.successCount++;
        } catch (e) {
          const error = e as Error;
          this.logger.error(`${batchLabel} error: ${error.message}`);
          this.failureCount++;
        }
      });

      await Promise.allSettled(promises);

      if (i + this.BATCH_SIZE < totalItems) {
        await new Promise((resolve) => setTimeout(resolve, this.DELAY_MS));
      }
    }
  }

  private async sendBroadcastToUsers(
    bot: Bot<BotContext>,
    users: UserDto[],
    textToSend: string,
    broadcast: Broadcast,
  ) {
    await this.processBatch(
      users,
      async (user) => {
        const result = await safeSendMessage(bot, user.telegramId || 0, textToSend);
        if ('message_id' in result && result?.message_id) {
          const broadcastMessage = this.broadcastMessageRepo.create({
            broadcast,
            telegramId: String(user.telegramId),
            messageId: result.message_id,
          });
          await this.broadcastMessageRepo.save(broadcastMessage);
        } else {
          if ('error_code' in result && result.error_code && result.description) {
            this.errorMessages.push(`<code>${user.telegramId}</code>: ${result.description}`);
            throw new Error(result.description);
          }
          throw new Error(`Failed to send to ${user.telegramId}`);
        }
      },
      'broadcast',
    );
  }

  private async editBroadcastMessages(
    bot: Bot<BotContext>,
    messages: BroadcastMessage[],
    textToEdit: string,
  ) {
    await this.processBatch(
      messages,
      async (msg) => {
        const result = await safeEditMessage(bot, msg.telegramId, msg.messageId, textToEdit);
        if (result !== true && 'error_code' in result) {
          this.errorMessages.push(`${result.description}`);
          throw new Error(result.description);
        }
      },
      'edit',
    );
  }

  private async deleteBroadcastMessages(bot: Bot<BotContext>, messages: BroadcastMessage[]) {
    await this.processBatch(
      messages,
      async (msg) => {
        await bot.api.deleteMessage(Number(msg.telegramId), msg.messageId);
      },
      'delete',
    );
  }

  register(bot: Bot<BotContext>) {
    bot.command('message', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) return;

      const textToSend = this.parseMessageText(ctx.message?.text);
      if (!textToSend) return;

      const validUsers = await this.getValidUsers();

      const broadcast = this.broadcastRepo.create({
        adminId: Number(process.env.TELEGRAM_ADMIN_ID),
        messageText: textToSend,
      });
      await this.broadcastRepo.save(broadcast);

      await this.sendBroadcastToUsers(bot, validUsers, textToSend, broadcast);
      const errorMessagesText = this.mapErrorMessages(this.errorMessages);

      const reply = this.getBroadcastMessage(broadcast, errorMessagesText);
      await ctx.reply(reply, { parse_mode: 'HTML' });
      this.resetState();
    });

    bot.command('editmsg', async (ctx) => {
      if (!(await this.isAdmin(ctx.from?.id))) return;

      const message = ctx.message?.text;
      if (!message) return;

      // Parse broadcast ID
      const parseResult = this.parseBroadcastId(message, 'editmsg');
      if ('error' in parseResult) {
        await ctx.reply(parseResult.error, { parse_mode: 'HTML' });
        return;
      }

      // Extract new text
      const parts = message.split('\n');
      const textToSend = parts.slice(1).join('\n');

      if (!textToSend || textToSend.startsWith('/start')) {
        await ctx.reply('❌ No message text provided.');
        return;
      }

      // Fetch broadcast and messages
      const result = await this.fetchBroadcastWithMessages(ctx, parseResult.broadcastId);
      if (!result) return;

      const { broadcast, messages } = result;

      await this.editBroadcastMessages(bot, messages, textToSend);

      const errorMessagesText = this.mapErrorMessages(this.errorMessages);
      const reply = this.getBroadcastMessage(broadcast, errorMessagesText, 'edit');
      await ctx.reply(reply, { parse_mode: 'HTML' });
      this.resetState();
    });

    bot.command('deletemsg', async (ctx) => {
      if (!(await this.isAdmin(ctx.from?.id))) return;

      const message = ctx.message?.text;
      if (!message) return;

      // Parse broadcast ID
      const parseResult = this.parseBroadcastId(message, 'deletemsg');
      if ('error' in parseResult) {
        await ctx.reply(parseResult.error, { parse_mode: 'HTML' });
        return;
      }

      // Fetch broadcast and messages
      const result = await this.fetchBroadcastWithMessages(ctx, parseResult.broadcastId);
      if (!result) return;

      const { broadcast, messages } = result;

      await this.deleteBroadcastMessages(bot, messages);

      // Delete the broadcast record and messages from DB
      await this.broadcastMessageRepo.delete({ broadcast: { id: broadcast.id } });
      await this.broadcastRepo.delete({ id: broadcast.id });

      const errorMessagesText = this.mapErrorMessages(this.errorMessages);

      await ctx.reply(
        `🗑️ Delete message complete!
        
Broadcast ID: ${broadcast.id}
Deleted: ${this.successCount}
Failed: ${this.failureCount}

<blockquote expandable>
${errorMessagesText ? `<b>Errors:</b>\n${errorMessagesText}` : 'No errors.'}
</blockquote>
`,
        {
          parse_mode: 'HTML',
        },
      );
      this.resetState();
    });
  }

  private parseBroadcastId(
    message: string,
    commandName: string,
  ): { broadcastId: number } | { error: string } {
    const regex = new RegExp(`\\/${commandName}\\s+(\\d+)`);
    const match = message.match(regex);

    if (!match) {
      return { error: `❌ Invalid format. Use: <code>/${commandName} &lt;BROADCAST_ID&gt;</code>` };
    }

    return { broadcastId: Number(match[1]) };
  }

  private async fetchBroadcastWithMessages(
    ctx: BotContext,
    broadcastId: number,
  ): Promise<{ broadcast: Broadcast; messages: BroadcastMessage[] } | null> {
    const broadcast = await this.broadcastRepo.findOne({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      await ctx.reply(`❌ Broadcast ID ${broadcastId} not found.`);
      return null;
    }

    const messages = await this.broadcastMessageRepo.find({
      where: { broadcast: { id: broadcastId } },
    });

    if (messages.length === 0) {
      await ctx.reply(`❌ No messages found for broadcast ID ${broadcastId}.`);
      return null;
    }

    return { broadcast, messages };
  }

  private getBroadcastMessage(
    broadcast: Broadcast,
    errorMessages?: string | null,
    type: 'send' | 'edit' = 'send',
  ): string {
    const getAction = (type: 'send' | 'edit') => {
      switch (type) {
        case 'send':
          return '✅Message sent';
        case 'edit':
          return '📝Message edited';
        default:
          return 'processed';
      }
    };

    const action = getAction(type);

    return `${action}
Broadcast ID: ${broadcast.id}
Success: ${this.successCount}
Failed: ${this.failureCount}

✏️To edit: 
<code>/editmsg ${broadcast.id}
${broadcast.messageText}</code>

🗑️ To delete:
<blockquote>
<code>/deletemsg ${broadcast.id}</code>
</blockquote>

<blockquote expandable>
${errorMessages ? `<b>Errors:</b>\n${errorMessages}` : 'No errors.'}
</blockquote>
`;
  }

  private mapErrorMessages(errorMessages?: string[]): string | null {
    return errorMessages && errorMessages.length > 0 ? errorMessages.join('\n') : null;
  }

  private resetState() {
    this.successCount = 0;
    this.failureCount = 0;
    this.errorMessages = [];
  }

  private isAdmin(fromId: number | undefined) {
    const adminId = Number(process.env.TELEGRAM_ADMIN_ID);
    return fromId === adminId;
  }

  private parseMessageText(message: string | undefined): string | null {
    console.log(message);
    if (!message || message.startsWith('/start')) return null;
    const textToSend = message.split('\n').slice(1).join('\n');
    if (!textToSend || textToSend.startsWith('/start')) return null;
    return textToSend;
  }

  private async getValidUsers(): Promise<UserDto[]> {
    const isProd = process.env.NODE_ENV === 'production';
    const users = isProd ? await this.remnaService.getAllUsers() : mockBroadcastUserDto;
    const adminId = Number(process.env.TELEGRAM_ADMIN_ID);
    return users.filter((u) => u.telegramId && u.telegramId !== adminId);
  }
}
