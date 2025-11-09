import { BotContext } from '@bot/bot.types'; // your existing BotContext type
import { PollAnswer } from '@grammyjs/types';
import { Injectable, Logger } from '@nestjs/common';
import { RemnaService } from '@remna/remna.service'; // optional if you store users
import { Bot } from 'grammy';

@Injectable()
export class PollAnswerListener {
  private readonly logger = new Logger(PollAnswerListener.name);

  constructor(private readonly remnaService: RemnaService) {}

  register(bot: Bot<BotContext>) {
    bot.on('poll_answer', async (ctx) => {
      try {
        const answer = ctx.update.poll_answer as PollAnswer;
        const userId = answer.user?.id;
        const pollId = answer.poll_id;
        const selectedOptionIds = answer.option_ids;

        if (!userId) {
          this.logger.warn('Poll answer received without user ID.');
          return;
        }
        const user = await this.remnaService.getUserByTgId(userId);

        // Log or store answer
        this.logger.log(
          `📊 Poll answer from ${user?.username || userId}: poll ${pollId}, options: [${selectedOptionIds.join(', ')}]`,
        );

        // Example: store in DB
        await this.savePollAnswer({
          userId,
          pollId,
          selectedOptionIds,
        });
      } catch (error) {
        this.logger.error('Failed to process poll answer:', error);
      }
    });
  }

  private async savePollAnswer(data: {
    userId: number;
    pollId: string;
    selectedOptionIds: number[];
  }) {
    // Here you can save to your database — for example:
    // await this.remnaService.savePollAnswer(data);
    this.logger.debug(`✅ Saved poll answer: ${JSON.stringify(data)}`);
  }
}
