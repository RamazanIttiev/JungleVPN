import { randomBytes } from 'node:crypto';
import { User } from 'grammy/types';
import { Client, ClientDevice, ClientFlow } from './xui.model';

export const randomId = () => randomBytes(6).toString('hex');

export const generateClientBody = ({
  tgUser,
  device,
}: {
  tgUser: User;
  device: ClientDevice;
}): Client => {
  const expiryTime = new Date();
  expiryTime.setDate(expiryTime.getDate() + 90);

  return {
    id: randomId(),
    flow: (process.env.XUI_CLIENT_FLOW as ClientFlow) || 'xtls-rprx-vision',
    email: `${tgUser.username || tgUser.first_name}-${randomId()}`,
    limitIp: Number(process.env.XUI_LIMIT_IP),
    totalGB: 0,
    expiryTime: expiryTime.getTime(),
    enable: true,
    tgId: tgUser.id,
    subId: randomId(),
    comment: device || '',
    reset: 0,
  };
};
