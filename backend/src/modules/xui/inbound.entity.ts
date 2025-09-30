import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ClientFlow = 'xtls-rprx-vision';

@Entity('inbound_clients')
export class InboundClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  flow: ClientFlow;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'int', default: 1 })
  limitIp: number;

  @Column({ type: 'bigint', default: 0 })
  totalGB: number;

  @Column({ type: 'bigint', nullable: true })
  expiryTime: number; // unix timestamp (ms)

  @Column({ default: true })
  enable: boolean;

  @Column({ nullable: true })
  tgId: string; // telegram user id

  @Column({ unique: true })
  subId: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'int', default: 0 })
  reset: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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

export interface StreamSettings {
  network: string; // e.g., "tcp"
  security: string; // e.g., "reality"
  externalProxy: unknown[]; // empty array in sample
  realitySettings: RealitySettings;
  tcpSettings: TcpSettings;
}

export interface RealitySettings {
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

export interface RealityInnerSettings {
  publicKey: string;
  fingerprint: string; // e.g., "chrome"
  serverName: string;
  spiderX: string; // e.g., "/"
}

export interface TcpSettings {
  acceptProxyProtocol: boolean;
  header: {
    type: string; // e.g., "none"
  };
}

export interface InboundSettingsPayload {
  clients: InboundClient[];
}

export class Inbound {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'jsonb' })
  settings: string;

  @Column({ type: 'jsonb' })
  streamSettings: string;
}
