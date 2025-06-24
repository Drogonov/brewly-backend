import { Controller, All, Req, Res, HttpStatus } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import type { Request, Response } from 'express';
import { Public } from 'src/app/common/decorators';
import { ErrorsKeys, LocalizationKey, WebKeys } from 'src/app/common/localization/generated';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';
import { I18nContext } from 'nestjs-i18n';

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

    const t = (key: WebKeys) => this.localization.getWebText(key);

    return res
      .status(HttpStatus.NOT_FOUND)
      .render('not-found/404', {
        siteTitle: await t(WebKeys.SITE_TITLE),
        metaDescription: await t(WebKeys.META_DESCRIPTION),
        ogTitle: await t(WebKeys.OG_TITLE),
        ogDescription: await t(WebKeys.OG_DESCRIPTION),
        ogImage: await t(WebKeys.OG_IMAGE),
        headerLogo: await t(WebKeys.HEADER_LOGO),
        navPrivacy: await t(WebKeys.NAV_PRIVACY),
        navSupport: await t(WebKeys.NAV_SUPPORT),
        lang: I18nContext.current()?.lang ?? 'en',


        notFoundTitle: await t(WebKeys.NOT_FOUND_TITLE),
        notFoundMessage: await t(WebKeys.NOT_FOUND_MESSAGE),
        backHomeText: await t(WebKeys.BACK_HOME_TEXT),
        contactSupportText: await t(WebKeys.CONTACT_SUPPORT_TEXT),
        supportEmail: "support@brewly.ru",
        homeUrl: '/',

        currentYear: new Date().getFullYear(),
        reservedText: await t(WebKeys.RESERVED_TEXT),
      });
  }
}