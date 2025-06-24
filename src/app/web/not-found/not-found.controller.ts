import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import type { Request, Response } from 'express';
import { Public } from 'src/app/common/decorators';
import { ErrorsKeys, LocalizationKey, WebKeys } from 'src/app/common/localization/generated';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';

@Controller()      // ← no ‘path’ here
export class NotFoundController {
  private readonly staticDir = process.env.NODE_ENV === 'production'
    ? join(process.cwd(), 'dist', 'public')
    : join(process.cwd(), 'src', 'public');

  constructor(
    private readonly localization: LocalizationStringsService,
  ) { }

  // catch absolutely everything
  @All('*')
  @Public()
  async handle404(@Req() req: Request, @Res() res: Response) {
    const url = req.originalUrl;

    // 1) API calls → JSON 404
    if (url.startsWith('/api')) {
      const message = await this.localization.getErrorText(
        ErrorsKeys.NOT_FOUND, // предполагается ключ NOT_FOUND
      );
      return res.status(404).json({ message: message });
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

    const title = await this.localization.getWebText(
      WebKeys.NOT_FOUND_TITLE, // например: «Page not found»
    );
    const message = await this.localization.getWebText(
      WebKeys.NOT_FOUND_MESSAGE, // предполагается ключ NOT_FOUND
    );

    return res
      .status(HttpStatus.NOT_FOUND)
      .render('not-found/404', {
        title,
        message,
        homeUrl: '/',
        supportEmail: process.env.SUPPORT_EMAIL,
      });
  }
}