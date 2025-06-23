// src/app.common/services/template/template.service.ts
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly templates = new Map<string, Handlebars.TemplateDelegate>();

  constructor() {
    const mailTplPath = join(__dirname, 'templates', 'mail.template.html');
    const source = readFileSync(mailTplPath, 'utf-8');
    this.templates.set('otp-mail', Handlebars.compile(source));
  }

  render(templateName: 'otp-mail', context: Record<string, any>): string {
    const tpl = this.templates.get(templateName);
    if (!tpl) throw new Error(`Template "${templateName}" not found`);
    return tpl(context);
  }
}