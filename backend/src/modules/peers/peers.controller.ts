import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../../shared/auth/api-key.guard';
import { PeerStatus } from './peer.entity';
import { PeersService } from './peers.service';

@UseGuards(ApiKeyGuard)
@ApiTags('peers')
@Controller('peers')
export class PeersController {
  constructor(private readonly peersService: PeersService) {}

  @Post('add')
  async add(@Body('telegramId') telegramId: string): Promise<{ id: string; status: PeerStatus }> {
    const data = await this.peersService.add(telegramId);
    return {
      id: data.id,
      status: data.status,
    };
  }

  @Get('list')
  async list(@Query('telegramId') telegramId: string): Promise<{ id: string; createdAt: Date }[]> {
    return await this.peersService.getMappedPeers(telegramId);
  }

  // Removed WireGuard config endpoint as part of VLESS migration

  @Delete('removeAll')
  async removeAll(): Promise<{ success: boolean }> {
    return await this.peersService.removeAll();
  }

  @Delete(':peerId')
  async remove(@Param('peerId', new ParseUUIDPipe()) peerId: string) {
    return await this.peersService.remove(peerId);
  }
}
