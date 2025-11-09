import { UserStatus } from '@user/user.model';

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

export interface UpdateUserDTO extends CreateUserDTO {
  uuid: string;
}

export type WebHookEvent =
  | 'user.expires_in_24_hours'
  | 'user.expires_in_48_hours'
  | 'user.expires_in_72_hours';
