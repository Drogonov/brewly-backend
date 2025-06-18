// src/app.modules/auth/auth.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import {
  AuthRequestDto,
  IStatusResponse,
  OTPRequestDto,
  StatusResponseDto,
  StatusType,
} from './dto';
import { ITokensResponse } from 'src/app.common/dto';
import { JWTSessionService } from 'src/app.common/services/jwt-session/jwt-session.service';
import { MailService } from 'src/app.common/services/mail/mail.service';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import {
  BusinessErrorKeys,
  ErrorsKeys,
  ValidationErrorKeys,
} from 'src/app.common/localization/generated';
import { ErrorFieldCode } from 'src/app.common/error-handling/exceptions';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtSessionService: JWTSessionService,
    private mailService: MailService,
    private configService: ConfigurationService,
    private errorHandlingService: ErrorHandlingService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * Sign up by creating a new user + a personal company + relation.
   * Sends an OTP afterward.
   *
   * Throws:
   *   422 Unprocessable Entity if delivering email fails.
   *   422 If user Already exist
   */
  async signUpLocal(dto: AuthRequestDto): Promise<IStatusResponse> {
    const hash = await argon.hash(dto.password);
    const { otp, hashedOtp } = await this.generateOtp();
    let createdUser: User;

    try {
      // wrap in a transaction: create user → company → relation → connect company
      await this.prisma.$transaction(async (prismaTx) => {
        const user = await prismaTx.user.create({
          data: {
            email: dto.email,
            hash,
            otpHash: hashedOtp,
            otpExpiresAt: new Date(Date.now() + 10 * 60_000),
            isVerificated: false,
          },
        });
        createdUser = user;

        const company = await prismaTx.company.create({
          data: { companyName: 'Personal', isPersonal: true },
        });

        await prismaTx.userToCompanyRelation.create({
          data: {
            userId: user.id,
            companyId: company.id,
            role: Role.OWNER,
          },
        });

        await prismaTx.user.update({
          where: { id: user.id },
          data: { currentCompany: { connect: { id: company.id } } },
        });
      });
    } catch (error) {
      // Prisma “unique constraint failed (P2002)”: email is already taken
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.USER_ALREADY_EXIST);
      }
      // re‐throw any other unexpected Prisma errors
      throw error;
    }

    // Try to send OTP email. If it fails, wrap in 422 with a BusinessErrorKey
    try {
      await this.sendOtp(createdUser.email, otp);
      return { status: StatusType.SUCCESS };
    } catch (error) {
      // If sendOtp throws (e.g. SMTP down), we catch and re‐throw
      throw await this.errorHandlingService.getBusinessError(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
        { email: `"${createdUser.email}"` }
      );
    }
  }

  /**
   * Verify OTP. If it’s incorrect or expired, throw a 422.
   * Otherwise, mark user as verified and return new tokens.
   */
  async verifyOTP(dto: OTPRequestDto): Promise<ITokensResponse> {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        // No such user → treat as “incorrect OTP”
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.INCORRECT_OTP
        );
      }

      // Check expiry
      if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.OTP_EXPIRED
        );
      }

      const isOtpValid = await argon.verify(user.otpHash, dto.otp);
      if (!isOtpValid) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.INCORRECT_OTP
        );
      }

      // Mark as verified; clear otpHash (and expiry, if you store it)
      user = await this.prisma.user.update({
        where: { email: dto.email },
        data: { otpHash: null, isVerificated: true, otpExpiresAt: null },
      });

      return await this.jwtSessionService.createSession(user, dto.language);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend OTP to an existing user.  
   * Throws:
   *   422 if user not found,
   *   422 if user already verified,
   *   403 if password mismatch,
   *   422 if email‐sending fails.
   */
  async resendOTP(dto: AuthRequestDto): Promise<StatusResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        // User must exist to resend
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_DOESNT_EXIST
        );
      }

      if (user.isVerificated) {
        // If they’re already verified, we don’t send another
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_ALREADY_VERIFIED
        );
      }

      const passwordMatches = await argon.verify(user.hash, dto.password);
      if (!passwordMatches) {
        // Tests expect 403 if wrong password
        throw await this.errorHandlingService.getForbiddenError(
          ErrorsKeys.PASSWORDS_DOESNT_MATCH
        );
      }

      const { otp, hashedOtp } = await this.generateOtp();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          otpHash: hashedOtp,
          isVerificated: false,
          otpExpiresAt: new Date(Date.now() + 10 * 60_000),
        },
      });

      try {
        await this.sendOtp(dto.email, otp);
        return { status: StatusType.SUCCESS };
      } catch (error) {
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
          { email: `"${dto.email}"` }
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign in with email+password.  
   * Throws 422 if user doesn’t exist or password is incorrect.  
   * Throws 422 if not yet verified.
   */
  async signInLocal(dto: AuthRequestDto): Promise<ITokensResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: { sessions: true, currentCompany: true },
      });

      if (!user) {
        throw await this.errorHandlingService.getValidationError([{
          errorFieldsCode: ErrorFieldCode.email,
          validationErrorKey: ValidationErrorKeys.USER_DOESNT_EXIST
        }]);
      }

      if (!user.isVerificated) {
        // Not verified → business‐layer 422
        throw await this.errorHandlingService.getBusinessError(
          BusinessErrorKeys.USER_NOT_VERIFIED
        );
      }

      const passwordMatches = await argon.verify(user.hash, dto.password);
      if (!passwordMatches) {
        throw await this.errorHandlingService.getValidationError([{
          errorFieldsCode: ErrorFieldCode.password,
          validationErrorKey: ValidationErrorKeys.INCORRECT_PASSWORD
        }]);
      }

      return await this.jwtSessionService.createSession(user, dto.language);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout: end the current refresh-token session.  
   * Always returns { status: SUCCESS }, even if user doesn’t exist.
   */
  async logout(userId: number, rt?: string): Promise<IStatusResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { sessions: true, currentCompany: true },
      });
      if (!user) {
        return { status: StatusType.SUCCESS };
      }

      await this.jwtSessionService.endSession(user, rt);
      return { status: StatusType.SUCCESS };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh tokens:  
   *   - 403 if user doesn’t exist or has no sessions  
   *   - 403 if RT hash mismatch (expired or invalid)  
   *   - otherwise return brand-new tokens
   */
  async refreshTokens(userId: number, rt: string, language: string): Promise<ITokensResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { sessions: true, currentCompany: true },
      });

      if (!user || !user.sessions) {
        throw await this.errorHandlingService.getForbiddenError(
          ErrorsKeys.SESSION_EXPIRED
        );
      }

      // If RT doesn’t match one of the stored sessions, that method should throw
      await this.jwtSessionService.verifyRtMatch(user, rt);

      // If verifyRtMatch succeeds, get fresh tokens & update RT hash
      const tokens = await this.jwtSessionService.getTokens(
        user.id,
        user.currentCompanyId,
        user.email,
        language
      );
      await this.jwtSessionService.updateRtHash(user, rt, tokens.refresh_token);

      return tokens;
    } catch (error) {
      throw error;
    }
  }

  // MARK: - Private Methods

  /**
   * Sends the OTP email. In dev, skip the actual mail‐send.
   */
  private async sendOtp(email: string, otp: string): Promise<void> {
    if (this.configService.getEnv() !== 'development') {
      await this.mailService.sendOtpEmail(email, otp);
    }
    // await this.mailService.sendOtpEmail(email, otp);
  }

  /**
   * Generate (6-digit) OTP + a hash. In dev, you can return a fixed code.
   */
  private async generateOtp(): Promise<{ otp: string; hashedOtp: string }> {
    let otp: string;
    if (this.configService.getEnv() === 'development') {
      otp = this.configService.getOtpDevCode();
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    // otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await argon.hash(otp);
    return { otp, hashedOtp };
  }
}