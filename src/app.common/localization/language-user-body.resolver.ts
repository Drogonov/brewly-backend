import { I18nResolver } from 'nestjs-i18n';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguageUserBodyResolver implements I18nResolver {
  async resolve(req: any): Promise<string | string[] | undefined> {
    // 1) If the user is authenticated and we have `req.user.language`
    if (req.user && typeof req.user.language === 'string') {
      return req.user.language;
    }
    // 2) Otherwise if the client sent { language: 'ru' } in the JSON body
    if (req.body && typeof req.body.language === 'string') {
      return req.body.language;
    }
    // 3) Let the other resolvers (query/header) pick it up
    return undefined;
  }
}