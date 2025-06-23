import { Controller, All, Req, Res } from '@nestjs/common';
import { join } from 'path';
import type { Request, Response } from 'express';
import { Public } from 'src/app.common/decorators';

@Controller()
export class NotFoundController {
  private readonly staticDir = join(__dirname, 'static');

  @All('*')
  @Public()
  handle404(@Req() req: Request, @Res() res: Response) {
    const url = req.originalUrl;
    if (url.startsWith('/api') || /\.[a-zA-Z0-9]+$/.test(url)) {
      // any /api/* or file-extension URL → real 404
      return res.sendStatus(404);
    } else {
      // otherwise serve client app’s 404 page
      return res
        .status(404)
        .sendFile(join(this.staticDir, '404.html'));
    }
  }
}