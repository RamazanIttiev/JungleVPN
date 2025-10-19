import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const config = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: false,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
