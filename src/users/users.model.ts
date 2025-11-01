export type UserStatus = 'trial' | 'expired' | 'active';
export type UserDevice = 'ios' | 'android' | 'macOS' | 'windows';
export type UserClient = {
  id: string;
  device: UserDevice;
  subId: string;
};
