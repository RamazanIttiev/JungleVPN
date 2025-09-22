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
import { ApiKeyGuard } from '../../shared/auth/api-key.guard';
import { PeerStatus } from './peer.entity';
import { PeersService } from './peers.service';
import { WireGuardService } from './wireguard.service';

@UseGuards(ApiKeyGuard)
@Controller('peers')
export class PeersController {
  constructor(
    private readonly peersService: PeersService,
    private readonly wireGuardService: WireGuardService,
  ) {}

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

  @Get('config')
  async config(@Query('telegramId') telegramId: string) {
    const peer = await this.peersService.getByTelegramId(telegramId);

    const filename = `vpn-${peer.createdAt.getTime()}.conf`;
    const content = this.wireGuardService.buildWireGuardClientConfig(peer);

    return {
      filename,
      content,
    };
  }

  @Delete('removeAll')
  async removeAll(): Promise<{ success: boolean }> {
    return await this.peersService.removeAll();
  }

  @Delete(':peerId')
  async remove(@Param('peerId', new ParseUUIDPipe()) peerId: string) {
    return await this.peersService.remove(peerId);
  }
}
