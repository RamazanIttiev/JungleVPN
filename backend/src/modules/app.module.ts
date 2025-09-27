import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../shared/config/config.module';
import { UsersModule } from './users/users.module';
import { XuiModule } from './xui/xui.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
    UsersModule,
    XuiModule,
  ],
})
export class AppModule {}
