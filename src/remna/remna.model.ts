export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';

export interface RemnaResponse<Data> {
  response: Data;
}

export interface CreateUserDTO {
  username: string;
  expireAt: string;
  activeInternalSquads?: string[];
  status: UserStatus;
  telegramId: number;
}

export interface UpdateUserDTO extends CreateUserDTO {
  uuid: string;
}

export interface User {
  uuid: string;
  shortUuid: string;
  telegramId: number;
  username: string;
  expireAt: string;
  subscriptionUrl: string;
  activeInternalSquads: string[];
  status: UserStatus;
}
