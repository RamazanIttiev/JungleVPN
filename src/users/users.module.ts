import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@users/users.entity';
import { XuiService } from '@xui/xui.service';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, XuiService],
  exports: [UsersService],
})
export class UsersModule {}
