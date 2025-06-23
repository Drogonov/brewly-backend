import { Controller, All, Req, Res } from '@nestjs/common';
import { join } from 'path';
import type { Request, Response } from 'express';
import { Public } from 'src/app.common/decorators';

@Controller()
export class AppController {
  @All('*')
  @Public() 
  handle404(@Req() req: Request, @Res() res: Response) {
    const url = req.originalUrl;

    if (url.startsWith('/api') || /\.[a-zA-Z0-9]+$/.test(url)) {
      return res.sendStatus(404);
    }
    return res.status(404).sendFile(join(__dirname, '..', 'public-pages', '404.html'));
  }
}