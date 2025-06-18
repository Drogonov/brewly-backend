import { Injectable } from '@nestjs/common';
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
  ) {
    // Initialize Brevo transactional emails API
    this.transactionalEmailsApi = new Brevo.TransactionalEmailsApi();
    // Set API key for authentication
    this.transactionalEmailsApi.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      this.config.getEmailAPI(),
    );
  }

  /**
   * Sends an OTP verification email upon account registration.
   */
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const payload = this.makeOtpPayload(
      email,
      '🌟 Verify Your Account with Brewly!',
      'Welcome to Brewly!',
      'Thank you for signing up. Your journey to best cupping experience starts here.',
      otp,
    );

    try {
      await this.transactionalEmailsApi.sendTransacEmail(payload);
    } catch (error) {
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
      );
    }
  }

  /**
   * Sends an OTP email for updating the email address.
   */
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

    try {
      await this.transactionalEmailsApi.sendTransacEmail(payload);
    } catch (error) {
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
      );
    }
  }

  // MARK: - Helpers

  /**
   * DRY helper to construct a Brevo SendTransacEmail payload.
   */
  private makeOtpPayload(
    recipientEmail: string,
    subject: string,
    header: string,
    message: string,
    otp: string,
    additionalInfo: string = '',
  ): Brevo.SendSmtpEmail {
    const htmlContent = this.buildHtmlTemplate({ header, message, otp, additionalInfo });
    const textContent = `${header}\n\n${message}\n${additionalInfo ? additionalInfo + '\n' : ''
      }Your Verification Code: ${otp}\nGitHub: ${MailServiceConst.followUsLink}`;

    return {
      sender: MailServiceConst.fromEmail,
      to: [{ email: recipientEmail }],
      subject,
      htmlContent,
      textContent,
    };
  }

  /**
   * Builds the HTML template for OTP emails.
   */
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