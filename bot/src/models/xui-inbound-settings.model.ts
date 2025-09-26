export type InboundId = 1;
export type ClientFlow = 'xtls-rprx-vision';

export interface InboundClient {
  id: string;
  flow: ClientFlow;
  email: string;
  limitIp: number;
  totalGB: number;
  expiryTime: number;
  enable: boolean;
  tgId: string;
  subId: string;
  comment: string;
  reset: number;
}

export interface InboundSettingsPayload {
  clients: InboundClient[];
}

export interface InboundSettings {
  id: InboundId;
  settings: InboundSettingsPayload;
}

export interface XuiInbound {
  id: InboundId;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiryTime: number;
  clientStats: string | null;
  listen: string;
  port: number;
  protocol: 'vless' | string;
  settings: string; // raw JSON string per your API
  streamSettings: string; // raw JSON string per your API
  tag: string;
  sniffing: string; // raw JSON string per your API
}

export interface XuiResponse<T> {
  success: boolean;
  msg: string;
  obj: T;
}
