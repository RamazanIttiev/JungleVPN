import { Payment } from '@payments/payment.entity';
import { User } from '@users/users.entity';
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
  entities: [User, Payment],
  migrations: ['db/migrations/**'],
  migrationsRun: true,
  logging: process.env.ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
