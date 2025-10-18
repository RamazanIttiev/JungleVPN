export type UserStatus = 'expired' | 'active';
export type UserDevice = 'ios' | 'android' | 'macOS' | string;
export type UserClient = {
  id: string;
  device: string;
  subId: string;
};
