import { Controller, Get, Render, Res } from '@nestjs/common';
import { join } from 'path';
import type { Response } from 'express';
import { Public } from 'src/app/common/decorators';
import { WebKeys } from 'src/app/common/localization/generated';
import { LocalizationStringsService } from 'src/app/common/localization/localization-strings.service';

@Controller()
export class PublicPagesController {
  private readonly staticDir = process.env.NODE_ENV === 'production'
    ? join(process.cwd(), 'dist', 'public')
    : join(process.cwd(), 'src', 'public');

  constructor(
    private readonly localization: LocalizationStringsService,
  ) { }

  @Get()
  @Public()
  @Render('public-pages/index')
  async serveIndex() {
    const t = (key: WebKeys) => this.localization.getWebText(key);

    return {
      siteTitle: await t(WebKeys.SITE_TITLE),
      metaDescription: await t(WebKeys.META_DESCRIPTION),
      ogTitle: await t(WebKeys.OG_TITLE),
      ogDescription: await t(WebKeys.OG_DESCRIPTION),
      ogImage: await t(WebKeys.OG_IMAGE),
      headerLogo: await t(WebKeys.HEADER_LOGO),
      navPrivacy: await t(WebKeys.NAV_PRIVACY),
      navSupport: await t(WebKeys.NAV_SUPPORT),

      welcomeTitle: await t(WebKeys.WELCOME_TITLE),
      leadText: await t(WebKeys.LEAD_TEXT),
      downloadAppText: await t(WebKeys.DOWNLOAD_APP_TEXT),
      githubIosText: await t(WebKeys.GITHUB_IOS_TEXT),
      githubSwaggerText: await t(WebKeys.GITHUB_SWAGGER_TEXT),
      githubBackendText: await t(WebKeys.GITHUB_BACKEND_TEXT),

      currentYear: new Date().getFullYear(),
      reservedText: await t(WebKeys.RESERVED_TEXT),
    };
  }

  @Get('privacy-policy')
  @Public()
  servePrivacy(@Res() res: Response) {
    return res.sendFile(join(this.staticDir, 'privacy-policy.html'));
  }

  @Get('support')
  @Public()
  @Render('public-pages/support')
  async serveSupport() {
    const t = (key: WebKeys) => this.localization.getWebText(key);
    
    return {
      siteTitle: await t(WebKeys.SITE_TITLE),
      metaDescription: await t(WebKeys.META_DESCRIPTION),
      ogTitle: await t(WebKeys.OG_TITLE),
      ogDescription: await t(WebKeys.OG_DESCRIPTION),
      ogImage: await t(WebKeys.OG_IMAGE),
      headerLogo: await t(WebKeys.HEADER_LOGO),
      navPrivacy: await t(WebKeys.NAV_PRIVACY),
      navSupport: await t(WebKeys.NAV_SUPPORT),

      supportTitle: await t(WebKeys.SUPPORT_TITLE),
      supportContactText: await t(WebKeys.SUPPORT_CONTACT_TEXT),
      supportEmail: await t(WebKeys.SUPPORT_EMAIL),

      faqTitle: await t(WebKeys.FAQ_TITLE),
      faqQuestion1: await t(WebKeys.FAQ_QUESTION_1),
      faqAnswer1: await t(WebKeys.FAQ_ANSWER_1),
      faqQuestion2: await t(WebKeys.FAQ_QUESTION_2),
      faqAnswer2: await t(WebKeys.FAQ_ANSWER_2),
      faqQuestion3: await t(WebKeys.FAQ_QUESTION_3),
      faqAnswer3: await t(WebKeys.FAQ_ANSWER_3),

      currentYear: new Date().getFullYear(),
      reservedText: await t(WebKeys.RESERVED_TEXT),
    };
  }
}