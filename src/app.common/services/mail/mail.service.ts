import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as Brevo from '@getbrevo/brevo';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { BusinessErrorKeys } from 'src/app.common/localization/generated';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { TemplateService } from '../template/template.service';

// Centralized constants & copy
const MailServiceConst = {
  fromEmail: {
    name: 'Brewly Team',
    email: 'noreply@brewly.ru',
  } as const,
  followUsLink: 'https://github.com/Drogonov',
  portfolioLink: 'https://vlezko.com',
  supportLink: 'https://brewly.ru/support',
};

@Injectable()
export class MailService {
  private readonly transactionalEmailsApi: Brevo.TransactionalEmailsApi;

  constructor(
    private readonly config: ConfigurationService,
    private readonly errorHandlingService: ErrorHandlingService,
    private readonly logger: PinoLogger,
    private readonly templateService: TemplateService
  ) {
    this.transactionalEmailsApi = new Brevo.TransactionalEmailsApi();
    this.transactionalEmailsApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.config.getEmailAPI(),
    );
  }

  /**
   * Send an OTP email to the given address
   */
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const subject = '🌟 Verify Your Account with Brewly!';
    const header = 'Welcome to Brewly!';
    const message = 'Thank you for signing up. Your journey to best cupping experience starts here.';
    const additionalInfoLines = [
      'Enter this verification code on our app form to get started.',
      'If you didn’t request this email, please ignore it or let us know.',
    ];

    const payload = this.makeOtpPayload(
      email,
      subject,
      header,
      message,
      otp,
      additionalInfoLines,
    );

    try {
      await this.transactionalEmailsApi.sendTransacEmail(payload);
    } catch (err: any) {
      const status = err.status || err.statusCode;
      const body = err?.response?.body || err?.message || JSON.stringify(err);
      this.logger.error({ status, body, to: email }, 'sendOtpEmail failed');
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
      );
    }
  }

  /**
   * Send an OTP to update email address
   */
  async sendOtpToUpdateEmail(
    currentEmail: string,
    newEmail: string,
    otp: string,
  ): Promise<void> {
    const subject = '🔄 Verify Your Email Update Request';
    const header = 'Email Update Verification';
    const message = 'We received a request to update your email address.';
    const additionalInfoLines = [
      'If you initiated this request, use the OTP below to verify the change.',
      `New email: ${newEmail}`,
      'If you didn’t request this email, please ignore it or let us know.',
    ];

    const payload = this.makeOtpPayload(
      currentEmail,
      subject,
      header,
      message,
      otp,
      additionalInfoLines,
    );

    try {
      await this.transactionalEmailsApi.sendTransacEmail(payload);
    } catch (err: any) {
      const status = err.status || err.statusCode;
      const body = err?.response?.body || err?.message || JSON.stringify(err);
      this.logger.error(
        { status, body, from: currentEmail, newEmail },
        'sendOtpToUpdateEmail failed',
      );
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
      );
    }
  }

  /**
   * Build the payload for Brevo transactional email
   */
  private makeOtpPayload(
    recipientEmail: string,
    subject: string,
    header: string,
    message: string,
    otp: string,
    additionalInfoLines: string[],
  ): Brevo.SendSmtpEmail {
    const htmlContent = this.buildHtmlTemplate({
      subject,
      header,
      message,
      otp,
      additionalInfoLines,
      followUsLink: MailServiceConst.followUsLink,
      // portfolioLink: MailServiceConst.portfolioLink,
      supportLink: MailServiceConst.supportLink,
      appStoreLink: this.config.getAppStoreURL(),
      year: new Date().getFullYear(),
    });

    const textContent = [
      header,
      '',
      message,
      ...additionalInfoLines,
      `Your Verification Code: ${otp}`,
      `GitHub: ${MailServiceConst.followUsLink}`,
    ].join('\n');

    return {
      sender: MailServiceConst.fromEmail,
      to: [{ email: recipientEmail }],
      subject,
      htmlContent,
      textContent,
    };
  }

  /**
   * Build the HTML template for OTP emails
   */
  private buildHtmlTemplate(context: Record<string, any>): string {
    return this.templateService.render('otp-mail', context);
  }
}