import { Column, Entity, PrimaryColumn } from 'typeorm';

export interface InboundClient {
  id: string;
  flow: string;
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

@Entity('xui_inbound_settings')
export class InboundSettings {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'jsonb' })
  settings: string;
}
