import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
@Controller()
export class AppController {
  @Get()
  async getBotDialog(@Res() res: Response) {
    res.status(HttpStatus.OK).send('Bot service started');
  }
}
