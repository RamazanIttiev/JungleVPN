export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';

export interface RemnaResponse<Data> {
  response: Data;
}

export interface CreateUserDTO {
  username: string;
  expireAt?: string;
  activeInternalSquads?: string[];
  status?: UserStatus;
  telegramId: number;
}

export interface User {
  uuid: string;
  shortUuid: string;
  expireAt: string;
  subscriptionUrl: string;
}
