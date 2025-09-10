import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../shared/auth/api-key.guard';
import { UsersService } from './users.service';

@UseGuards(ApiKeyGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('ensure')
  async ensure(@Query('telegramId') telegramId: string, @Headers('x-api-key') _apiKey: string) {
    const user = await this.users.findOrCreateByTelegramId(telegramId);
    return { id: user.id };
  }
}
