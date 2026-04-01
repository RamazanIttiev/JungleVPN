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

  userTraffic: z.object({
    usedTrafficBytes: z.number(),
    lifetimeUsedTrafficBytes: z.number(),
    onlineAt: z.string(),
    lastConnectedNodeUuid: z.string().nullable(),
    firstConnectedAt: z.string().nullable(),
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

  userTraffic: {
    usedTrafficBytes: 860903544,
    lifetimeUsedTrafficBytes: 860903544,
    onlineAt: '2026-02-09T21:57:30.119Z',
    lastConnectedNodeUuid: 'd3659e85-01ec-4865-90c4-86fd8d23686f',
    firstConnectedAt: '2026-02-09T18:48:30.150Z',
  },
};

export const mockBroadcastUserDto: UserDto[] = [
  {
    ...mockUserDto,
    uuid: '504dbd6c-09e6-4fea-9a73-92974ef6185f',
    username: '7683608743',
    telegramId: 7683608743,
    userTraffic: {
      ...mockUserDto.userTraffic,
      firstConnectedAt: null,
    },
  },
  {
    ...mockUserDto,
    uuid: 'cab71e6c-5577-4ebb-8756-719a5edaf5d6',
    username: '5986698166',
    telegramId: 5986698166,
    email: '7683608743',
    userTraffic: {
      ...mockUserDto.userTraffic,
      firstConnectedAt: '2026-02-09T21:57:30.119Z',
    },
  },
];

export type UserDto = z.infer<typeof CreateUserResponseSchema>;
export type CreateUserRequestDto = z.infer<typeof CreateUserRequestSchema>;
export interface UpdateUserRequestDto extends Partial<CreateUserRequestDto> {
  uuid: string;
}
export type CreateUserResponseDto = z.infer<typeof CreateUserResponseSchema>;
