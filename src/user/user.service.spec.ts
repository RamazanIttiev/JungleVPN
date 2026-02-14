import 'reflect-metadata';
import { ReferralService } from '@referral/referral.service';
import { RemnaService } from '@remna/remna.service';
import { UserDto } from '@user/user.model';
import { GrammyError } from 'grammy';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let mockRemnaService: any;
  let mockReferralService: any;

  beforeEach(() => {
    mockRemnaService = {
      deleteUser: vi.fn(),
      getUserByTgId: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
    };
    mockReferralService = {
      deleteUser: vi.fn(),
    };

    service = new UserService(
      mockRemnaService as RemnaService,
      mockReferralService as ReferralService,
    );

    vi.spyOn(service, 'deleteUser').mockResolvedValue(undefined);
  });

  describe('handleInvalidUserRemoval', () => {
    const mockUser: UserDto = {
      uuid: 'user-uuid',
      telegramId: 123456789,
      userTraffic: {
        firstConnectedAt: null,
      },
    } as any;

    it('should delete user if they blocked the bot and never connected (error as string)', async () => {
      const error = 'Forbidden: bot was blocked by the user';
      const result = await service.handleInvalidUserRemoval(mockUser, error);

      expect(result).toBe(true);
      expect(service.deleteUser).toHaveBeenCalledWith('user-uuid');
      expect(mockReferralService.deleteUser).toHaveBeenCalledWith(123456789);
    });

    it('should delete user if chat was not found and never connected (error as string)', async () => {
      const error = 'Bad Request: chat not found';
      const result = await service.handleInvalidUserRemoval(mockUser, error);

      expect(result).toBe(true);
      expect(service.deleteUser).toHaveBeenCalledWith('user-uuid');
      expect(mockReferralService.deleteUser).toHaveBeenCalledWith(123456789);
    });

    it('should delete user if they blocked the bot and never connected (error as GrammyError)', async () => {
      const error = {
        description: 'Forbidden: bot was blocked by the user',
      } as GrammyError;
      const result = await service.handleInvalidUserRemoval(mockUser, error);

      expect(result).toBe(true);
      expect(service.deleteUser).toHaveBeenCalledWith('user-uuid');
      expect(mockReferralService.deleteUser).toHaveBeenCalledWith(123456789);
    });

    it('should NOT delete user if they have already connected even if blocked', async () => {
      const connectedUser = {
        ...mockUser,
        userTraffic: {
          firstConnectedAt: '2026-01-01T00:00:00Z',
        },
      } as UserDto;

      const error = 'Forbidden: bot was blocked by the user';
      const result = await service.handleInvalidUserRemoval(connectedUser, error);

      expect(result).toBe(false);
      expect(service.deleteUser).not.toHaveBeenCalled();
      expect(mockReferralService.deleteUser).not.toHaveBeenCalled();
    });

    it('should NOT delete user for other types of errors', async () => {
      const error = 'Network timeout';
      const result = await service.handleInvalidUserRemoval(mockUser, error);

      expect(result).toBe(false);
      expect(service.deleteUser).not.toHaveBeenCalled();
      expect(mockReferralService.deleteUser).not.toHaveBeenCalled();
    });

    it('should handle edge case: error is undefined', async () => {
      const result = await service.handleInvalidUserRemoval(mockUser, undefined as any);
      expect(result).toBe(false);
    });

    it('should handle edge case: error description is missing in GrammyError', async () => {
      const error = {} as GrammyError;
      const result = await service.handleInvalidUserRemoval(mockUser, error);
      expect(result).toBe(false);
    });

    it('should handle edge case: user telegramId is null', async () => {
      const userNoTg = { ...mockUser, telegramId: null } as any;
      const error = 'Forbidden: bot was blocked by the user';
      const result = await service.handleInvalidUserRemoval(userNoTg, error);

      expect(result).toBe(true);
      expect(service.deleteUser).toHaveBeenCalledWith('user-uuid');
      expect(mockReferralService.deleteUser).toHaveBeenCalledWith(0);
    });
  });
});
