export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';
export type TrafficLimitStrategy = 'NO_RESET' | 'DAY' | 'WEEK' | 'MONTH';

export interface User {
  uuid: string;
  shortUuid: string;
  telegramId: number;
  username: string;
  expireAt: string;
  subscriptionUrl: string;
  activeInternalSquads: string[];
  status: UserStatus;
  trafficLimitStrategy: TrafficLimitStrategy;
  subLastOpenedAt: string | null;
  description: null | string;
  createdAt: string;
  updatedAt: string;
  firstConnectedAt: string | null;
  activeUserInbounds: Array<{
    uuid: string;
    tag: string;
    type: string;
    network: string | null;
    security: string | null;
  }>;
}
