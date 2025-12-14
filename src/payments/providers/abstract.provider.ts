import {
  CreatePaymentDto,
  PaymentProvider,
  PaymentSession,
  PaymentStatus,
  WebhookResult,
} from '@payments/payments.model';

export abstract class AbstractPaymentProvider {
  abstract readonly id: PaymentProvider;

  abstract createPayment(dto: CreatePaymentDto): Promise<PaymentSession>;
  abstract checkPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  abstract isValidWebhookPayload(payload: any): boolean;
  abstract parseWebhook(payload: any): WebhookResult;
}
