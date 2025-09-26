import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Peer } from './peer.entity';
import { PeersController } from './peers.controller';
import { PeersService } from './peers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Peer]), UsersModule],
  providers: [PeersService],
  controllers: [PeersController],
  exports: [PeersService],
})
export class PeersModule {}
