import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import * as Brevo from '@getbrevo/brevo';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { BusinessErrorKeys } from 'src/app.common/localization/generated';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';

// Centralized constants
const MailServiceConst = {
  fromEmail: {
    name: 'Brewly Team',
    email: 'noreply@brewly.ru'
  } as const,
  followUsLink: 'https://github.com/Drogonov/brewly-backend',
};

@Injectable()
export class MailService {
  private readonly transactionalEmailsApi: Brevo.TransactionalEmailsApi;

  constructor(
    private readonly config: ConfigurationService,
    private readonly errorHandlingService: ErrorHandlingService,
    private readonly logger: PinoLogger,
  ) {
    // Tag every log line with "MailService" as the context
    this.logger.setContext(MailService.name);

    this.transactionalEmailsApi = new Brevo.TransactionalEmailsApi();

    // Log (masked) API key at debug level
    const apiKey = this.config.getEmailAPI();
    this.logger.debug(
      { apiKey: apiKey ? apiKey.replace(/.(?=.{4})/g, '*') : '<<missing>>' },
      'Using Brevo API key'
    );

    this.transactionalEmailsApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const payload = this.makeOtpPayload(
      email,
      '🌟 Verify Your Account with Brewly!',
      'Welcome to Brewly!',
      'Thank you for signing up. Your journey to best cupping experience starts here.',
      otp,
    );

    // Log full payload
    this.logger.debug({ payload }, 'sendOtpEmail payload');

    try {
      const response = await this.transactionalEmailsApi.sendTransacEmail(payload);
      this.logger.info({ response, to: email }, 'sendOtpEmail succeeded');
    } catch (error) {
      // Log raw error for inspection
      this.logger.error({ err: error, to: email }, 'sendOtpEmail failed');
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
      );
    }
  }

  async sendOtpToUpdateEmail(
    currentEmail: string,
    newEmail: string,
    otp: string,
  ): Promise<void> {
    const additionalInfo = `If you initiated this request, please use the OTP below to verify the change. New email: ${newEmail}`;
    const subject = '🔄 Verify Your Email Update Request';
    const payload = this.makeOtpPayload(
      currentEmail,
      subject,
      'Email Update Verification',
      'We received a request to update your email address.',
      otp,
      additionalInfo,
    );

    this.logger.debug({ payload }, 'sendOtpToUpdateEmail payload');

    try {
      const response = await this.transactionalEmailsApi.sendTransacEmail(payload);
      this.logger.info(
        { response, from: currentEmail, newEmail },
        'sendOtpToUpdateEmail succeeded'
      );
    } catch (error) {
      this.logger.error(
        { err: error, from: currentEmail, newEmail },
        'sendOtpToUpdateEmail failed'
      );
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
      );
    }
  }

  private makeOtpPayload(
    recipientEmail: string,
    subject: string,
    header: string,
    message: string,
    otp: string,
    additionalInfo: string = '',
  ): Brevo.SendSmtpEmail {
    const htmlContent = this.buildHtmlTemplate({ header, message, otp, additionalInfo });
    const textContent = [
      header,
      '',
      message,
      additionalInfo,
      `Your Verification Code: ${otp}`,
      `GitHub: ${MailServiceConst.followUsLink}`
    ]
      .filter(Boolean)
      .join('\n');

    return {
      sender: MailServiceConst.fromEmail,
      to: [{ email: recipientEmail }],
      subject,
      htmlContent,
      textContent,
    };
  }

  private buildHtmlTemplate({
    header,
    message,
    otp,
    additionalInfo = '',
  }: {
    header: string;
    message: string;
    otp: string;
    additionalInfo?: string;
  }): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 20px; text-align: center; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h1 style="color: #0047AB;">${header}</h1>
        <p style="font-size: 18px; color: #333;">${message}</p>
        ${additionalInfo ? `<p style="font-size: 16px; color: #555;">${additionalInfo}</p>` : ''}
        <p style="font-size: 20px; font-weight: bold; color: #0047AB;">Your Verification Code:</p>
        <p style="font-size: 24px; font-weight: bold; color: #F05032;">${otp}</p>
        <p style="font-size: 14px; color: #777;">
          Follow us on <a href="${MailServiceConst.followUsLink}" target="_blank" style="color: #F05032; text-decoration: none;">GitHub</a>
        </p>
        <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Brewly. All rights reserved.</p>
      </div>
    `;
  }
}