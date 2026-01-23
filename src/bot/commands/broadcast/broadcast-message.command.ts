import { BotContext } from '@bot/bot.types';
import { BroadcastBase } from '@bot/commands/broadcast/broadcast.base';
import { Broadcast } from '@bot/commands/broadcast/entities/broadcast.entity';
import { BroadcastMessage } from '@bot/commands/broadcast/entities/broadcast-message.entity';
import { safeReplyMessage, safeSendMessage, safeSendPhoto } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { Bot } from 'grammy';
import { Repository } from 'typeorm';

@Injectable()
export class BroadcastMessageCommand extends BroadcastBase {
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
    bot.on('message:photo', (ctx) => this.proccessMessage(ctx, bot));
    bot.command('message', (ctx) => this.proccessMessage(ctx, bot));
  }

  private proccessMessage = async (ctx: BotContext, bot: Bot<BotContext>) => {
    if (!this.isAdmin(ctx.from?.id)) return;

    // Check if message has a photo
    const photo = ctx.message?.photo;
    const imageFileId = photo ? photo[photo.length - 1].file_id : undefined;

    // Parse text from message or caption
    const rawText = imageFileId ? ctx.message?.caption : ctx.message?.text;
    const entities = imageFileId ? ctx.message?.caption_entities : ctx.message?.entities;
    const textToSend = this.parseMessageText(rawText, entities, '/message');

    if (!textToSend) return;

    const validUsers = await this.getValidUsers();

    const broadcast = this.broadcastRepo.create({
      messageText: textToSend,
    });
    await this.broadcastRepo.save(broadcast);

    await ctx.reply('🚀 Starting broadcast...');
    await this.sendBroadcastToUsers(bot, validUsers, textToSend, broadcast, imageFileId);

    const errorMessagesText = this.mapErrorMessages(this.errorMessages);
    const resultMessage = this.getBroadcastMessage(broadcast, errorMessagesText);

    await safeReplyMessage(ctx, resultMessage);
    this.resetState();
  };

  private async sendBroadcastToUsers(
    bot: Bot<BotContext>,
    users: UserDto[],
    textToSend: string,
    broadcast: Broadcast,
    imageFileId?: string,
  ) {
    await this.processBatch(
      users,
      async (user) => {
        const result = imageFileId
          ? await safeSendPhoto(bot, user.telegramId || 0, imageFileId, textToSend)
          : await safeSendMessage(bot, user.telegramId || 0, textToSend);

        const isError = typeof result === 'string';

        if (isError) {
          this.errorMessages.push(`<code>${user.telegramId}</code>: ${result}`);
          throw new Error(result);
        }

        const broadcastMessage = this.broadcastMessageRepo.create({
          broadcast,
          telegramId: String(user.telegramId),
          messageId: result.message_id,
        });
        await this.broadcastMessageRepo.save(broadcastMessage);
      },
      'broadcast',
    );
  }

  private getBroadcastMessage(broadcast: Broadcast, errorMessages?: string | null): string {
    return `✅Message sent
Broadcast ID: ${broadcast.id}
Success: ${this.successCount}
Failed: ${this.failureCount}

✏️To edit: 
<blockquote>
<code>/editmsg ${broadcast.id}
${broadcast.messageText}</code>
</blockquote>

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
