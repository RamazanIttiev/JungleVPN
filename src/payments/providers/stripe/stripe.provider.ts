import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '@payments/payment.entity';
import { CreatePaymentDto, PaymentProvider, PaymentSession } from '@payments/payments.model';
import { AbstractPaymentProvider } from '@payments/providers/abstract.provider';
import { StripeWebhookService } from '@payments/providers/stripe/stripe-webhook.service';
import Stripe from 'stripe';
import { Repository } from 'typeorm';

@Injectable()
export class StripeProvider implements AbstractPaymentProvider {
  readonly id: PaymentProvider = 'stripe';
  readonly stripe: Stripe;
  private readonly logger = new Logger(StripeProvider.name);

  constructor(
    readonly stripeWebhookService: StripeWebhookService,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY || '');
  }

  async handleWebhook(payload: Stripe.Event) {
    await this.stripeWebhookService.handleWebhook(payload);
  }

  async createPayment(dto: CreatePaymentDto): Promise<PaymentSession> {
    const priceId = this.getPriceId(dto.payment.amount);
    const customerId = await this.getCustomerId(dto.userId);

    if (customerId) {
      const hasActiveSubscription = await this.hasActiveSubscription(customerId);
      if (hasActiveSubscription) {
        return this.createPortalSession(customerId);
      }
      return this.createCheckoutSession(priceId, customerId);
    }

    const newCustomer = await this.getOrCreateCustomer(dto, null);
    return this.createCheckoutSession(priceId, newCustomer);
  }

  private async createCheckoutSession(priceId: string, customer: string): Promise<PaymentSession> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: process.env.RETURN_URL || 'https://t.me/your_bot_username',
        cancel_url: process.env.RETURN_URL || 'https://t.me/your_bot_username',
        phone_number_collection: {
          enabled: false,
        },
      });

      return {
        id: customer,
        url: session.url || '',
        customer,
      };
    } catch (error) {
      this.logger.error('Error creating Stripe session', error);
      throw error;
    }
  }

  async createPortalSession(customer: string): Promise<PaymentSession> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer,
        return_url: process.env.RETURN_URL || 'https://t.me/your_bot_username',
        configuration: process.env.STRIPE_CUSTOMER_PORTAL_CONFIG || '',
      });

      await this.paymentRepository.update(
        { stripeCustomerId: customer },
        {
          url: session.url,
        },
      );

      return {
        ...session,
        id: session.customer,
      };
    } catch (error) {
      this.logger.error(`Error creating portal session for customer ${customer}`, error);
      throw error;
    }
  }

  async retrieveCustomer(customerId: string | null) {
    if (!customerId) return null;
    return await this.stripe.customers.retrieve(customerId);
  }

  private async getOrCreateCustomer(
    dto: CreatePaymentDto,
    customer: string | null,
  ): Promise<string> {
    if (customer) {
      return customer;
    }
    const newCustomer = await this.stripe.customers.create({
      metadata: { ...dto.metadata },
    });
    return newCustomer.id;
  }

  private async getCustomerId(userId: string): Promise<string | null> {
    const lastPayment = await this.paymentRepository.findOne({
      where: { userId, provider: 'stripe' },
      order: { createdAt: 'DESC' },
    });

    return lastPayment?.stripeCustomerId || null;
  }

  async hasActiveSubscription(customerId: string): Promise<boolean> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
      });

      return subscriptions.data.some((sub) => sub.status === 'active' || sub.status === 'trialing');
    } catch (error) {
      this.logger.error(`Error checking subscription for customer ${customerId}`, error);
      return false;
    }
  }

  private getPriceId(amount: number): string {
    let priceId = '';
    switch (amount) {
      case Number(process.env.PRICE_EUR_MONTH_1):
        priceId = process.env.STRIPE_PRICE_ID_MONTH_1 || '';
        break;
      case Number(process.env.PRICE_EUR_MONTH_3):
        priceId = process.env.STRIPE_PRICE_ID_MONTH_3 || '';
        break;
      case Number(process.env.PRICE_EUR_MONTH_6):
        priceId = process.env.STRIPE_PRICE_ID_MONTH_6 || '';
        break;
      default:
        this.logger.error(`Unknown amount: ${amount}`);
        throw new Error('Invalid payment amount');
    }

    if (!priceId) {
      this.logger.error(`Price ID not found for amount: ${amount}`);
      throw new Error('Price configuration missing');
    }
    return priceId;
  }
}
