import { BotContext } from '@bot/bot.types';
import { BroadcastBase } from '@bot/commands/broadcast/broadcast.base';
import { Broadcast } from '@bot/commands/broadcast/entities/broadcast.entity';
import { BroadcastMessage } from '@bot/commands/broadcast/entities/broadcast-message.entity';
import { safeEditMessage, safeEditMessageCaption } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemnaService } from '@remna/remna.service';
import { Bot } from 'grammy';
import { Repository } from 'typeorm';

@Injectable()
export class BroadcastEditCommand extends BroadcastBase {
  constructor(
    readonly remnaService: RemnaService,
    @InjectRepository(Broadcast)
    readonly broadcastRepo: Repository<Broadcast>,
    @InjectRepository(BroadcastMessage)
    readonly broadcastMessageRepo: Repository<BroadcastMessage>,
  ) {
    super(remnaService, broadcastRepo, broadcastMessageRepo);
  }

  register(bot: Bot<BotContext>) {
    bot.command('editmsg', async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) return;

      const message = ctx.message?.text;
      if (!message) return;

      const parseResult = this.parseBroadcastId(message, 'editmsg');
      if ('error' in parseResult) {
        await ctx.reply(parseResult.error, { parse_mode: 'HTML' });
        return;
      }

      const parts = message.split('\n');
      const textToSend = parts.slice(1).join('\n');

      if (!textToSend || textToSend.startsWith('/start')) {
        await ctx.reply('❌ No message text provided.');
        return;
      }

      const result = await this.fetchBroadcastWithMessages(ctx, parseResult.broadcastId);
      if (!result) return;

      const { broadcast, messages } = result;

      await this.editBroadcastMessages(bot, messages, textToSend);

      const errorMessagesText = this.mapErrorMessages(this.errorMessages);
      const reply = this.getBroadcastMessage(broadcast, errorMessagesText);
      await ctx.reply(reply, { parse_mode: 'HTML' });
      this.resetState();
    });
  }

  private async editBroadcastMessages(
    bot: Bot<BotContext>,
    messages: BroadcastMessage[],
    textToEdit: string,
  ) {
    await this.processBatch(
      messages,
      async (msg) => {
        // Try editing as caption first (for photo messages)
        let result = await safeEditMessageCaption(
          bot,
          msg.telegramId,
          msg.messageId,
          textToEdit,
        );

        // If caption edit fails (likely text-only message), try editing as text
        if (result !== true && 'error_code' in result) {
          if (result.error_code === 400) {
            // Message is not a media message, edit as text instead
            result = await safeEditMessage(bot, msg.telegramId, msg.messageId, textToEdit);
          }
        }

        if (result !== true && 'error_code' in result) {
          this.errorMessages.push(`${result.description}`);
          throw new Error(result.description);
        }
      },
      'edit',
    );
  }

  private getBroadcastMessage(broadcast: Broadcast, errorMessages?: string | null): string {
    return `📝Message edited
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
}
