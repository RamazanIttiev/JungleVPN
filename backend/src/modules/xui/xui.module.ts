import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundSettings } from './inbound-settings.entity';
import { XuiController } from './xui.controller';
import { XuiService } from './xui.service';

@Module({
  imports: [TypeOrmModule.forFeature([InboundSettings])],
  controllers: [XuiController],
  providers: [XuiService],
  exports: [XuiService],
})
export class XuiModule {}
