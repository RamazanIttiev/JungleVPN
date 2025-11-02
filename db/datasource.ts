import { Payment } from '@payments/payment.entity';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  // @ts-expect-error
  type: process.env.DB_TYPE,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Payment],
  migrations: ['dist/db/migrations/**/*.js'],
  migrationsRun: process.env.NODE_ENV === 'production',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
