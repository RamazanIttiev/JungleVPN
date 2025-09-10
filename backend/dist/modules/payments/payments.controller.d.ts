import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly payments;
    constructor(payments: PaymentsService);
    mock(body: {
        telegramId: string;
        amount?: number;
    }): Promise<{
        id: string;
        status: import("./payment.entity").PaymentStatus;
    }>;
}
