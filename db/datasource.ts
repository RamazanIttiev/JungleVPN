import { Payment } from '@payments/payment.entity';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Referral } from '../src/referral/referral.entity';

config();

export const dataSourceOptions: DataSourceOptions = {
  // @ts-expect-error
  type: process.env.POSTGRES_TYPE,
  port: Number(process.env.POSTGRES_PORT),
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Payment, Referral],
  migrations: ['dist/db/migrations/**/*.js'],
  migrationsRun: false,
  synchronize: false,
  logging: process.env.ENV === 'development',
  autoLoadEntities: true,
};

const dataSource = new DataSource(dataSourceOptions);
dataSource.initialize();
export default dataSource;
