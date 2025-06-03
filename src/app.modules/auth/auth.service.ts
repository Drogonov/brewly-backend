import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { AuthRequestDto, IStatusResponse, OTPRequestDto, StatusResponseDto, StatusType } from './dto';
import { ITokensResponse } from 'src/app.common/dto';
import { JWTSessionService } from 'src/app.common/services/jwt-session/jwt-session.service';
import { MailService } from 'src/app.common/services/mail/mail.service';
import { ErrorFieldCode } from 'src/app.common/error-handling/exceptions';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';
import { BusinessErrorKeys, ErrorsKeys, ValidationErrorKeys } from 'src/app.common/localization/generated';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtSessionService: JWTSessionService,
    private mailService: MailService,
    private configService: ConfigurationService,
    private errorHandlingService: ErrorHandlingService,
  ) { }

  async signUpLocal(dto: AuthRequestDto): Promise<IStatusResponse> {
    const hash = await argon.hash(dto.password);
    const { otp, hashedOtp } = await this.generateOtp();

    try {
      const user = await this.prisma.$transaction(async (prisma) => {
        // Step 1: Create the user
        const createdUser = await prisma.user.create({
          data: {
            email: dto.email,
            hash,
            otpHash: hashedOtp,
            isVerificated: false,
          },
        });

        // Step 2: Create the company
        const createdCompany = await prisma.company.create({
          data: {
            companyName: "Personal",
            isPersonal: true,
          },
        });

        // Step 3: Create the relation between the user and the company
        await prisma.userToCompanyRelation.create({
          data: {
            userId: createdUser.id,
            companyId: createdCompany.id,
            role: Role.OWNER,
          },
        });

        // Step 4: Update the user with the current company connection
        return await prisma.user.update({
          where: { id: createdUser.id },
          data: {
            currentCompany: { connect: { id: createdCompany.id } },
          },
        });
      });

      await this.sendOtp(user.email, otp);
      return { status: StatusType.SUCCESS };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.USER_ALREADY_EXIST);
      } else {
        throw error;
      }
    }
  }

  async verifyOTP(dto: OTPRequestDto): Promise<ITokensResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user || !(await argon.verify(user.otpHash, dto.otp))) {
        throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.INCORRECT_OTP);
      }

      await this.prisma.user.update({
        where: { email: dto.email },
        data: { otpHash: null, isVerificated: true },
      });

      return await this.jwtSessionService.createSession(user);
    } catch (error) {
      throw error;
    }
  }

  async resendOTP(dto: AuthRequestDto): Promise<StatusResponseDto> {
    try {
      const { otp, hashedOtp } = await this.generateOtp();
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (!user) {
        throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.USER_DOESNT_EXIST);
      }

      const passwordMatches = await argon.verify(user.hash, dto.password);
      if (!passwordMatches) {
        throw await this.errorHandlingService.getForbiddenError(ErrorsKeys.PASSWORDS_DOESNT_MATCH)
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpHash: hashedOtp, isVerificated: false },
      });

      await this.sendOtp(dto.email, otp);
      return { status: StatusType.SUCCESS };
    } catch (error) {
      throw error;
    }
  }

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
        throw await this.errorHandlingService.getBusinessError(BusinessErrorKeys.USER_NOT_VERIFIED);
      }

      const passwordMatches = await argon.verify(user.hash, dto.password);
      if (!passwordMatches) {
        throw await this.errorHandlingService.getValidationError([{
          errorFieldsCode: ErrorFieldCode.password,
          validationErrorKey: ValidationErrorKeys.INCORRECT_PASSWORD
        }]);
      }

      return await this.jwtSessionService.createSession(user);
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: number, rt: string): Promise<IStatusResponse> {    
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

  async refreshTokens(userId: number, rt: string): Promise<ITokensResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { sessions: true, currentCompany: true },
      });
      if (!user || !user.sessions) {
        throw await this.errorHandlingService.getForbiddenError(ErrorsKeys.SESSION_EXPIRED);
      }

      await this.jwtSessionService.verifyRtMatch(user, rt);
      const tokens = await this.jwtSessionService.getTokens(user.id, user.currentCompanyId, user.email);
      await this.jwtSessionService.updateRtHash(user, rt, tokens.refresh_token);
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  // MARK: - Private Methods

  /**
   * Sends the OTP email.
   * In development mode, it skips calling the mail service.
   */
  private async sendOtp(email: string, otp: string): Promise<void> {
    if (this.configService.getEnv() !== 'development') {
      await this.mailService.sendOtpEmail(email, otp);
    }
  }

  /**
   * Generates an OTP and its hashed version.
   * In development, returns a fixed OTP from configuration.
   * In production, generates a random 6-digit OTP.
   */
  private async generateOtp(): Promise<{ otp: string; hashedOtp: string }> {
    let otp: string;
    if (this.configService.getEnv() === 'development') {
      otp = this.configService.getOtpDevCode();
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    const hashedOtp = await argon.hash(otp);
    return { otp, hashedOtp };
  }
}