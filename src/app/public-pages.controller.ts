import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import type { Response } from 'express';
import { Public } from 'src/app.common/decorators';

@Controller()
export class PublicPagesController {
  @Get('privacy-policy')
  @Public()
  servePrivacy(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public-pages', 'privacy-policy.html'));
  }

  @Get('support')
  @Public()
  serveSupport(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public-pages', 'support.html'));
  }
}