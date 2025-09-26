import { randomUUID } from 'node:crypto';
import { ClientFlow, InboundId } from '../models/xui-inbound-settings.model';

export const generateClientBody = (
  tgId: string,
  enable: boolean = true,
  inboundId: InboundId = 1,
) => {
  const payload = {
    id: inboundId,
    settings: {
      clients: [
        {
          id: randomUUID(),
          flow: (process.env.XUI_CLIENT_FLOW as ClientFlow) || '',
          email: randomUUID(),
          limitIp: 0,
          totalGB: 0,
          expiryTime: 0,
          enable,
          tgId,
          subId: randomUUID(),
          comment: '',
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
