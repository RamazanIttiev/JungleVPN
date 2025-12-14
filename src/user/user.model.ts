import { z } from 'zod';

export type UserDevice = 'ios' | 'android' | 'macOS' | 'windows';
export type UserLocale = 'en' | 'ru';

export const CreateUserRequestSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(36)
    .regex(/^[a-zA-Z0-9_-]+$/),

  expireAt: z.iso.date(),

  uuid: z.uuidv4().optional(),

  telegramId: z.number().nullable().optional(),

  status: z.enum(['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED']).optional(),

  shortUuid: z.string().optional(),

  trojanPassword: z.string().min(8).max(32).optional(),

  vlessUuid: z.uuidv4().optional(),

  ssPassword: z.string().min(8).max(32).optional(),

  trafficLimitBytes: z.number().min(0).optional(),

  trafficLimitStrategy: z.enum(['NO_RESET', 'DAY', 'WEEK', 'MONTH']).optional(),

  createdAt: z.iso.date().optional(),

  lastTrafficResetAt: z.iso.date().optional(),

  description: z.string().optional(),

  tag: z
    .string()
    .regex(/^[A-Z0-9_]+$/)
    .max(16)
    .nullable()
    .optional(),

  email: z.email().nullable().optional(),

  hwidDeviceLimit: z.number().min(0).optional(),

  activeInternalSquads: z.array(z.uuidv4()).optional(),

  externalSquadUuid: z.uuidv4().nullable().optional(),
});
export const CreateUserResponseSchema = z.object({
  uuid: z.uuidv4(),
  shortUuid: z.string(),
  username: z.string(),

  status: z.enum(['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED']),

  usedTrafficBytes: z.number(),
  lifetimeUsedTrafficBytes: z.number(),

  trafficLimitBytes: z.number(),
  trafficLimitStrategy: z.enum(['NO_RESET', 'DAY', 'WEEK', 'MONTH']),

  subLastUserAgent: z.string().nullable(),
  subLastOpenedAt: z.iso.date(),

  expireAt: z.iso.date(),
  onlineAt: z.iso.date(),
  subRevokedAt: z.iso.date(),
  lastTrafficResetAt: z.iso.date(),

  trojanPassword: z.string(),
  vlessUuid: z.uuidv4(),
  ssPassword: z.string(),

  description: z.string().nullable(),
  tag: z.string().nullable(),
  telegramId: z.number().nullable(),
  email: z.email().nullable(),
  hwidDeviceLimit: z.number().nullable(),

  firstConnectedAt: z.iso.date(),

  lastTriggeredThreshold: z.number(),

  createdAt: z.iso.date(),
  updatedAt: z.iso.date(),

  activeInternalSquads: z.array(
    z.object({
      uuid: z.uuidv4(),
      name: z.string(),
    }),
  ),

  externalSquadUuid: z.uuidv4().nullable(),

  subscriptionUrl: z.string(),

  lastConnectedNode: z
    .object({
      connectedAt: z.iso.date(),
      nodeName: z.string(),
      countryCode: z.string(),
    })
    .nullable(),

  happ: z.object({
    cryptoLink: z.string(),
  }),
});

export const mockUserDto: UserDto = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  shortUuid: 'abc123',
  username: '575800239',

  status: 'ACTIVE',

  usedTrafficBytes: 0,
  lifetimeUsedTrafficBytes: 0,

  trafficLimitBytes: 1073741824,
  trafficLimitStrategy: 'MONTH',

  subLastUserAgent: null,
  subLastOpenedAt: new Date().toISOString(),

  expireAt: new Date().toISOString(),
  onlineAt: new Date().toISOString(),
  subRevokedAt: new Date().toISOString(),
  lastTrafficResetAt: new Date().toISOString(),

  trojanPassword: 'trojanpass',
  vlessUuid: '123e4567-e89b-12d3-a456-426614174001',
  ssPassword: 'sspass',

  description: null,
  tag: null,
  telegramId: 575800239,
  email: null,
  hwidDeviceLimit: null,

  firstConnectedAt: new Date().toISOString(),

  lastTriggeredThreshold: 0,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  activeInternalSquads: [],

  externalSquadUuid: null,

  subscriptionUrl: 'https://example.com/subscription',

  lastConnectedNode: null,

  happ: {
    cryptoLink: 'https://example.com/crypto',
  },
};

export const mockBroadcastUserDto: UserDto[] = [
  {
    ...mockUserDto,
    uuid: '223e4567-e89b-12d3-a456-426614174000',
    username: '7683608743',
    telegramId: 7683608743,
  },
  {
    ...mockUserDto,
    uuid: '223e4567-e89b-12d3-426614174000',
    username: '5986698166',
    telegramId: 5986698166,
  },
];

export type UserDto = z.infer<typeof CreateUserResponseSchema>;
export type CreateUserRequestDto = z.infer<typeof CreateUserRequestSchema>;
export interface UpdateUserRequestDto extends Partial<CreateUserRequestDto> {
  uuid: string;
}
export type CreateUserResponseDto = z.infer<typeof CreateUserResponseSchema>;
