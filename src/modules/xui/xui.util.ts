import { randomBytes } from 'node:crypto';
import { User } from 'grammy/types';
import { Client, ClientFlow, InboundId } from './xui.model';

const randomId = () => randomBytes(6).toString('hex');

export const generateClientBody = ({
  client,
  tgUser,
  enable = true,
  inboundId,
}: {
  client: Partial<Client>;
  tgUser: User;
  enable?: boolean;
  inboundId?: InboundId;
}) => {
  const payload = {
    id: inboundId || Number(process.env.XUI_INBOUND_ID),
    settings: {
      clients: [
        {
          id: randomId(),
          flow: (process.env.XUI_CLIENT_FLOW as ClientFlow) || 'xtls-rprx-vision',
          email: `${tgUser.username}-${randomId()}`,
          limitIp: Number(process.env.XUI_LIMIT_IP),
          totalGB: 0,
          expiryTime: 0,
          enable,
          tgId: tgUser.id,
          subId: `JungleVPN_${randomId()}`,
          comment: client.comment,
          reset: 0,
        },
      ],
    },
  };

  return {
    ...payload,
    settings: JSON.stringify(payload.settings),
  };
};
