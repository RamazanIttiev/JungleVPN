import { Injectable } from '@nestjs/common';
import { User as GrammyUser } from 'grammy/types';

@Injectable()
export class BotService {
  validateUser(user: GrammyUser | undefined) {
    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }
}
