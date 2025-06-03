import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { BusinessErrorKeys } from 'src/app.common/localization/generated';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';

@Injectable()
export class MailService {
  constructor(
    private readonly config: ConfigurationService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {
    sgMail.setApiKey(this.config.getEmailAPI());
  }

  /**
   * Sends an OTP verification email upon account registration.
   * @param email - The recipient email.
   * @param otp - The verification code.
   */
  async sendOtpEmail(email: string, otp: string) {
    const header = 'Welcome to Brewly!';
    const message = 'Thank you for signing up. Your journey to best cupping experience starts here.';
    const subject = '🌟 Verify Your Account with Brewly!';
    const htmlContent = this.buildHtmlTemplate({ header, message, otp });
    const textContent = `Welcome to Brewly!\n\nThank you for signing up.\nYour Verification Code: ${otp}\nGitHub: ${MailServiceConst.followUsLink}`;

    const msg = {
      to: email,
      from: MailServiceConst.fromEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL);
    }
  }

  /**
   * Sends an OTP email for updating the email address.
   * The email is sent to the current email address, including the new email for reference.
   * @param currentEmail - The user's current email address.
   * @param newEmail - The new email address the user wants to update to.
   * @param otp - The verification code.
   */
  async sendOtpToUpdateEmail(currentEmail: string, newEmail: string, otp: string) {
    const header = 'Email Update Verification';
    const message = 'We received a request to update your email address.';
    const additionalInfo = `If you initiated this request, please use the OTP below to verify the change. New email: ${newEmail}`;
    const subject = '🔄 Verify Your Email Update Request';
    const htmlContent = this.buildHtmlTemplate({ header, message, otp, additionalInfo });
    const textContent = `Email Update Verification\n\nWe received a request to update your email address.\nIf you initiated this request, please verify using the OTP: ${otp}\nNew email: ${newEmail}\nGitHub: ${MailServiceConst.followUsLink}`;

    const msg = {
      to: currentEmail,
      from: MailServiceConst.fromEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL);
    }
  }

  // MARK: - Private Methods

  /**
 * Helper to build the HTML content for emails.
 * @param header - The main header of the email.
 * @param message - The main message body.
 * @param otp - The verification OTP.
 * @param additionalInfo - Any additional information (optional).
 * @returns The full HTML message.
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

const MailServiceConst = {
  followUsLink: 'https://github.com/Drogonov/brewly-backend',
  fromEmail: {
    name: 'Brewly Team',
    email: 'dump@vlezko.com',
  }
} as const;