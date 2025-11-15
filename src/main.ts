import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT) || 3001;

  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on http://localhost:${port}`);

  const bot = app.get(BotService).bot;
  await bot.start();
}
bootstrap();
