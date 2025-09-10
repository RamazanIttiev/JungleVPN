import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../shared/auth/api-key.guard';
import { PaymentsService } from './payments.service';

@UseGuards(ApiKeyGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('mock')
  async mock(@Body() body: { telegramId: string; amount?: number }) {
    const payment = await this.payments.mockCreatePaid(body.telegramId, body.amount ?? 500);
    return { id: payment.id, status: payment.status };
  }
}
