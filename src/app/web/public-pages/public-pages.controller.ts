// src/app/web/public-pages/public-pages.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import type { Response } from 'express';
import { Public } from 'src/app/common/decorators';

@Controller()
export class PublicPagesController {
  // in dev we want src/client, in prod dist/client
  private readonly staticDir = process.env.NODE_ENV === 'production'
    ? join(process.cwd(), 'dist', 'client')
    : join(process.cwd(), 'src', 'client');

  @Get('privacy-policy')
  @Public()
  servePrivacy(@Res() res: Response) {
    return res.sendFile(join(this.staticDir, 'privacy-policy.html'));
  }

  @Get('support')
  @Public()
  serveSupport(@Res() res: Response) {
    return res.sendFile(join(this.staticDir, 'support.html'));
  }

  @Get()
  @Public()
  serveRoot(@Res() res: Response) {
    return res.sendFile(join(this.staticDir, 'index.html'));
  }
}