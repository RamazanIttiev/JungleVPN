import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { XuiModule } from './xui/xui.module';

@Module({
  imports: [
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
    BotModule,
    XuiModule,
  ],
})
export class AppModule {}
