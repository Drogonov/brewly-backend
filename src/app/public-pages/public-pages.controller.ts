import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import type { Response } from 'express';
import { Public } from 'src/app.common/decorators';

@Controller()
export class PublicPagesController {
  private readonly staticDir = join(__dirname, 'static');

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

  @Get('')
  @Public()
  serveRoot(@Res() res: Response) {
    return res.sendFile(join(this.staticDir, 'index.html'));
  }
}