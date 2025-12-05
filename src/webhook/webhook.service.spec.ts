import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from '@payments/payments.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebhookService } from './webhook.service';

vi.mock('@payments/payment.entity', () => {
  return {
    Payment: class {},
  };
});

describe('WebhookService', () => {
  let service: WebhookService;

  const mockEventEmitter = {
    emit: vi.fn(),
  };

  const mockPaymentsService = {
    updatePayment: vi.fn(),
  };

  beforeEach(() => {
    service = new WebhookService(
      mockEventEmitter as unknown as EventEmitter2,
      mockPaymentsService as unknown as PaymentsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateAndProcessRemna', () => {
    it('should throw BadRequestException for invalid signature', () => {
      process.env.REMNA_WEBHOOK_SECRET = 'secret';
      const payload = { event: 'test', data: {}, timestamp: '123' } as any;
      expect(() => service.validateAndProcessRemna('invalid', payload)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateAndProcessTorrent', () => {
    it('should throw BadRequestException for invalid token', () => {
      process.env.REMNA_TORRENT_WEBHOOK_TOKEN = 'token';
      const payload = {} as any;
      expect(() => service.validateAndProcessTorrent('invalid', payload)).toThrow(
        BadRequestException,
      );
    });

    it('should emit event for valid token', () => {
      process.env.REMNA_TORRENT_WEBHOOK_TOKEN = 'token';
      const payload = { username: 'test' } as any;
      service.validateAndProcessTorrent('token', payload);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('torrent.event', payload);
    });
  });
});
