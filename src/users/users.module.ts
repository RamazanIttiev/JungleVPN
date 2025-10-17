import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client, User } from '@users/users.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Client])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
