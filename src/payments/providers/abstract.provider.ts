import { CreatePaymentDto, PaymentProvider, PaymentSession } from '@payments/payments.model';

export abstract class AbstractPaymentProvider {
  abstract readonly id: PaymentProvider;

  abstract createPayment(dto: CreatePaymentDto): Promise<PaymentSession>;
  abstract handleWebhook(payload: any, ip?: string): Promise<void>;
}
