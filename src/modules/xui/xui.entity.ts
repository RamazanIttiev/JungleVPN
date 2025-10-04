export type InboundId = '1';
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

export interface InboundSettings {
  clients: InboundClient[];
}

export interface InboundStreamSettings {
  network: string; // e.g., "tcp"
  security: string; // e.g., "reality"
  externalProxy: unknown[]; // empty array in sample
  realitySettings: RealitySettings;
  tcpSettings: TcpSettings;
}

export interface Inbound {
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

interface RealitySettings {
  show: boolean;
  xver: number;
  dest: string; // host:port, e.g., "yahoo.com:443"
  serverNames: string[];
  privateKey: string;
  minClient: string;
  maxClient: string;
  maxTimediff: number;
  shortIds: string[];
  settings: RealityInnerSettings;
}

interface RealityInnerSettings {
  publicKey: string;
  fingerprint: string; // e.g., "chrome"
  serverName: string;
  spiderX: string; // e.g., "/"
}

interface TcpSettings {
  acceptProxyProtocol: boolean;
  header: {
    type: string; // e.g., "none"
  };
}
