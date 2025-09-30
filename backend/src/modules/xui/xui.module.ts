import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inbound } from './inbound.entity';
import { XuiController } from './xui.controller';
import { XuiService } from './xui.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inbound])],
  controllers: [XuiController],
  providers: [XuiService],
  exports: [XuiService],
})
export class XuiModule {}
