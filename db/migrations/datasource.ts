import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
  // @ts-expect-error
  type: process.env.DB_TYPE,
  url: process.env.DB_URL,
  entities: ['src/**/*.entity.js'],
  migrations: ['src/db/migrations/*.js'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: false,
  logging: process.env.ENV !== 'production',
  extra: {
    connectionLimit: 10, // Adjust based on your database connection pool requirements
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
