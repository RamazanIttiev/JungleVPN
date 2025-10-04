import { randomUUID } from 'node:crypto';
import { ClientFlow, InboundId } from './xui.entity';

export const generateClientBody = (tgId: string, enable: boolean = true, inboundId?: InboundId) => {
  const payload = {
    id: inboundId || Number(process.env.XUI_TEST_INBOUND),
    settings: {
      clients: [
        {
          id: randomUUID(),
          flow: (process.env.XUI_CLIENT_FLOW as ClientFlow) || 'xtls-rprx-vision',
          email: randomUUID(),
          limitIp: Number(process.env.XUI_LIMIT_IP),
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
