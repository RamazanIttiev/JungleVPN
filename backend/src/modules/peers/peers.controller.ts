import { Controller, Delete, Get, Header, Param, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../shared/auth/api-key.guard';
import { PeersService } from './peers.service';
import { WireGuardService } from './wireguard.service';

@UseGuards(ApiKeyGuard)
@Controller('peers')
export class PeersController {
  constructor(
    private readonly peersService: PeersService,
    private readonly wireGuardService: WireGuardService,
  ) {}

  @Get('issue')
  @Header('Content-Type', 'application/json')
  async issue(@Query('telegramId') telegramId: string) {
    const { token } = await this.peersService.issueConfigForTelegram(telegramId);

    return { token };
  }

  @Delete(':peerId')
  async remove(@Param('peerId') peerId: string, @Query('telegramId') telegramId: string) {
    await this.peersService.removePeer(peerId, telegramId);
    return { success: true };
  }

  @Get('list')
  @Header('Content-Type', 'application/json')
  async list(@Query('telegramId') telegramId: string) {
    const items = await this.peersService.listForTelegram(telegramId);
    return { items };
  }

  @Get('config')
  @Header('Content-Type', 'application/json')
  async config(@Query('telegramId') telegramId: string) {
    const peer = await this.peersService.getPeerByTgId(telegramId);

    if (!peer) {
      console.log('NO PEER');
      return;
    }

    const filename = `vpn-${peer.user.telegramId}.conf`;
    const content = this.wireGuardService.buildWireGuardClientConfig(peer);

    return {
      filename,
      content,
    };
  }

  // @Get(':token')
  // async getConfig(@Param('token') token: string, @Res() res: Response) {
  //   const peer = await this.peersService.getPeer(token);
  //
  //   if (!peer) throw new UnauthorizedException('Invalid or expired token');
  //
  //   const filename = `wg0-${peer.user.telegramId}.conf`;
  //   const content = this.wireGuardService.buildWireGuardClientConfig({
  //     clientPrivateKey: peer.privateKey,
  //     clientIpAddress: peer.ipAddress,
  //     serverPublicKey: process.env.WG_SERVER_PUBLIC_KEY || '',
  //     serverPublicIp: process.env.WG_SERVER_PUBLIC_IP || '',
  //     dns: process.env.WG_DNS || '1.1.1.1,8.8.8.8',
  //     allowedIps: process.env.WG_ALLOWED_IPS || '0.0.0.0/0, ::/0',
  //   });
  //
  //   res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  //   res.setHeader('Content-Type', 'application/wireguard');
  //   res.send(content);
  //
  //   // Optional: expire token after first download
  //   peer.token = undefined;
  //   await this.peersService.savePeer(peer);
  // }
}
