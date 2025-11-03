import { Payment } from '@payments/payment.entity';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  // @ts-expect-error
  type: process.env.POSTGRES_TYPE,
  port: Number(process.env.POSTGRES_PORT),
  host: process.env.POSTGRES_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [Payment],
  migrations: ['dist/db/migrations/**/*.js'],
  migrationsRun: process.env.NODE_ENV === 'production',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.ENV === 'development',
  autoLoadEntities: true,
};

const dataSource = new DataSource(dataSourceOptions);
dataSource.initialize();
export default dataSource;
