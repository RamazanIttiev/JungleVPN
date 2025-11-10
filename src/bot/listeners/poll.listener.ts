import { BotContext } from '@bot/bot.types'; // your existing BotContext type
import { PollAnswer } from '@grammyjs/types';
import { Injectable, Logger } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service'; // optional if you store users
import { Bot } from 'grammy';
import { AnalyticsService } from '../../analytics/analytics.service';

@Injectable()
export class PollAnswerListener {
  private readonly logger = new Logger(PollAnswerListener.name);

  constructor(
    private readonly remnaService: RemnaService,
    private analyticsService: AnalyticsService,
  ) {}

  register(bot: Bot<BotContext>) {
    bot.on('poll_answer', async (ctx) => {
      try {
        const answer = ctx.update.poll_answer as PollAnswer;
        const userId = answer.user?.id;
        const pollId = answer.poll_id;
        const selectedOptionIds = answer.option_ids;

        if (!userId) {
          this.logger.warn('⚠️ Poll answer received without user ID.');
          return;
        }

        const user = await this.remnaService.getUserByTgId(userId);
        const username = user?.username || `tg_${userId}`;
        const selected = selectedOptionIds.map(String).join(', ');

        this.logger.log(`📈 Poll answer from ${username}: poll ${pollId}, options: [${selected}]`);

        await this.analyticsService.appendRow([
          username,
          pollId,
          selected,
          new Date().toISOString(),
        ]);
      } catch (error) {
        this.logger.error('❌ Failed to process poll answer', error);
      }
    });
  }
}
