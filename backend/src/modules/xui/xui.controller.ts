import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ApiKeyGuard } from '../../shared/auth/api-key.guard';
import { Inbound, InboundSettingsPayload } from './inbound.entity';
import { XuiService } from './xui.service';

@UseGuards(ApiKeyGuard)
@ApiTags('xui')
@ApiCookieAuth('session')
@Controller()
export class XuiController {
  constructor(private readonly xui: XuiService) {}

  @Post('login')
  @ApiBody({
    description: 'Optional credentials override; if omitted, env vars are used',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'admin' },
        password: { type: 'string', example: '6G8mHCxx427a#:9RC1W2' },
      },
    },
    required: false,
  })
  async login(@Res() res: Response) {
    const username = process.env.XUI_USERNAME || '';
    const password = process.env.XUI_PASSWORD || '';

    const result = await this.xui.login(username, password);

    const setCookie = result.setCookie || [];
    if (Array.isArray(setCookie)) {
      res.setHeader('Set-Cookie', setCookie);
    }
    return res.status(result.status).send(result.data);
  }

  @Get(':inboundId')
  async getInbound(
    @Param('inboundId') inboundId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const sessionCookie = parseSessionCookie(req.headers.cookie);
    const result = await this.xui.forward(
      'GET',
      `/panel/api/inbounds/get/${inboundId}`,
      sessionCookie,
    );
    return res.status(result.status).send(result.data);
  }

  @Post('addClient')
  @ApiBody({
    description: 'Send id and client settings (stringified JSON)',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        settings: { type: 'string', description: 'stringified JSON' },
      },
      required: ['id', 'settings'],
    },
  })
  async addClient(@Body() body: Inbound, @Req() req: Request, @Res() res: Response) {
    const sessionCookie = parseSessionCookie(req.headers.cookie);

    const result = await this.xui.forward(
      'POST',
      `/panel/api/inbounds/addClient`,
      sessionCookie,
      body,
    );

    return res.status(result.status).send(result.data);
  }

  @Post('updateClient')
  @ApiBody({
    description: 'Send id and updated client settings (stringified JSON)',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        settings: { type: 'string', description: 'stringified JSON' },
      },
      required: ['id', 'settings'],
    },
  })
  async updateClient(@Body() body: Inbound, @Req() req: Request, @Res() res: Response) {
    const sessionCookie = parseSessionCookie(req.headers.cookie);

    const settingsObj: InboundSettingsPayload = JSON.parse(body.settings);

    const clientId = settingsObj.clients[0].id;

    const result = await this.xui.forward(
      'POST',
      `/panel/api/inbounds/updateClient/${clientId}`,
      sessionCookie,
      body,
    );

    return res.status(result.status).send(result.data);
  }

  @Post('deleteClient')
  @ApiBody({
    description: 'No body required',
    schema: {
      type: 'object',
      properties: {
        inboundId: { type: 'number' },
        clientId: { type: 'string', description: 'id' },
      },
    },
    required: true,
  })
  async delClient(
    @Body() body: { inboundId: number; clientId: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const sessionCookie = parseSessionCookie(req.headers.cookie);
    const { inboundId, clientId } = body;

    const result = await this.xui.forward(
      'POST',
      `/panel/api/inbounds/${inboundId}/delClient/${clientId}`,
      sessionCookie,
    );
    return res.status(result.status).send(result.data);
  }
}

function parseSessionCookie(cookieHeader?: string): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(';').map((c) => c.trim());
  const session = parts.find((c) => c.startsWith('3x-ui='));
  if (!session) return undefined;
  return session.substring('3x-ui='.length);
}
