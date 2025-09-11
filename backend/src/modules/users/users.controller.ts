import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../shared/auth/api-key.guard';
import { UsersService } from './users.service';

@UseGuards(ApiKeyGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post('create')
  async create(@Body('telegramId') telegramId: string): Promise<{ id: string }> {
    const user = await this.users.createUser(telegramId);
    return { id: user.id };
  }
}
