import { Controller, All, Req, Res } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import type { Request, Response } from 'express';
import { Public } from 'src/app/common/decorators';
import { PinoLogger } from 'nestjs-pino';

@Controller()      // ← no ‘path’ here
export class NotFoundController {
  private readonly staticDir = process.env.NODE_ENV === 'production'
    ? join(process.cwd(), 'dist', 'client')
    : join(process.cwd(), 'src', 'client');

  // catch absolutely everything
  @All('*')
  @Public()
  handle404(@Req() req: Request, @Res() res: Response) {
    const url = req.originalUrl;

    // 1) API calls → JSON 404
    if (url.startsWith('/api')) {
      return res.status(404).json({ message: 'Not Found' });
    }

    // 2) Any “file” request (css, js, png, etc) → serve if it exists…
    if (/\.[a-zA-Z0-9]+$/.test(url)) {
      const fp = join(this.staticDir, url);
      if (existsSync(fp)) {
        return res.sendFile(fp);
      }
      // …otherwise real 404
      return res.sendStatus(404);
    }

    // 3) Everything else → your SPA’s 404.html
    return res
      .status(404)
      .sendFile('404.html', { root: this.staticDir });
  }
}