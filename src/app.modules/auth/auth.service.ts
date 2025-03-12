import { ForbiddenException, Injectable } from '@nestjs/common';
import { Company, Prisma, Role, User } from '@prisma/client';
import * as argon from 'argon2';
import { PrismaService } from 'src/app.common/services/prisma/prisma.service';
import { AuthRequestDto, IStatusResponse, OTPRequestDto, StatusResponseDto, StatusType } from './dto';
import { ITokensResponse } from 'src/app.common/dto';
import { JWTSessionService } from 'src/app.common/services/jwt-session/jwt-session.service';
import { MailService } from 'src/app.common/services/mail/mail.service';
import { BusinessErrorException, ErrorSubCodes } from 'src/app.common/error-handling/exceptions';
import { LocalizationStringsService } from 'src/app.common/localization/localization-strings-service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtSessionService: JWTSessionService,
    private mailService: MailService,
    private localizationStringsService: LocalizationStringsService
  ) { }

  async signUpLocal(dto: AuthRequestDto): Promise<IStatusResponse> {
    const hash = await argon.hash(dto.password);
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = "666666";
    const hashedOtp = await argon.hash(otp);

    try {
      const user = await this.prisma.$transaction(async (prisma) => {
        // Step 1: Create the user
        const createdUser = await this.prisma.user.create({
          data: {
            email: dto.email,
            hash,
            otpHash: hashedOtp,
            isVerificated: false,
          },
        });

        // Step 2: Create the company
        const createdCompany = await this.prisma.company.create({
          data: {
            companyName: "Personal",
            isPersonal: true,
          },
        });

        // Step 3: Create the relation between the user and the company
        await this.prisma.userToCompanyRelation.create({
          data: {
            userId: createdUser.id,
            companyId: createdCompany.id,
            role: Role.OWNER
          },
        });

        // Step 4: Update the user with the current company connection
        return await this.prisma.user.update({
          where: { id: createdUser.id },
          data: {
            currentCompany: { connect: { id: createdCompany.id } },
          },
        });
      });

      // await this.mailService.sendOtpEmail(user.email, otp);
      return { status: StatusType.SUCCESS };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BusinessErrorException({
          errorSubCode: ErrorSubCodes.USER_ALREADY_EXIST,
          errorFields: [
            {
              fieldCode: 'email',
              errorMsg: 'Email is already registered, please sign in.',
            },
          ],
        });
      }
      throw error;
    }
  }

  async verifyOTP(dto: OTPRequestDto): Promise<ITokensResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !await argon.verify(user.otpHash, dto.otp)) {
      throw new BusinessErrorException({
        errorSubCode: ErrorSubCodes.INCORRECT_OTP,
        errorMsg: 'Incorrect OTP, please try again',
      });
    }

    await this.prisma.user.update({
      where: { email: dto.email },
      data: { otpHash: null, isVerificated: true },
    });

    // Delegate session/token creation to JWTSessionService
    const tokens = await this.jwtSessionService.createSession(user);
    return tokens;
  }

  async resendOTP(dto: AuthRequestDto): Promise<StatusResponseDto> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await argon.hash(otp);

    try {
      const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
      const passwordMatches = await argon.verify(user.hash, dto.password);
      if (!passwordMatches) {
        throw new BusinessErrorException({
          errorSubCode: ErrorSubCodes.INCORRECT_PASSWORD,
          errorFields: [
            { fieldCode: 'password', errorMsg: 'Incorrect password' },
          ],
        });
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otpHash: hashedOtp, isVerificated: false },
      });

      await this.mailService.sendOtpEmail(dto.email, otp);
      return { status: StatusType.SUCCESS };
    } catch (error) {
      throw error;
    }
  }

  async signInLocal(dto: AuthRequestDto): Promise<ITokensResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { sessions: true, currentCompany: true },
    });

    this.localizationStringsService.setLanguage('ru')
    // const text = await this.localizationStringsService.getAuthMessage('auth.errorUserAlreadyExists');
    const text = "await this.localizationStringsService.getAuthMessage('auth.errorUserAlreadyExists');";
    console.log(text);

    if (!user) {
      throw new BusinessErrorException({
        errorSubCode: ErrorSubCodes.USER_DOESNT_EXIST,
        errorFields: [{ fieldCode: 'email', errorMsg: 'Cannot find such user' }],
      });
    }

    if (!user.isVerificated) {
      throw new BusinessErrorException({
        errorSubCode: ErrorSubCodes.USER_NOT_VERIFIED,
        errorMsg: 'User is not verified. Please complete the registration process.',
      });
    }

    const passwordMatches = await argon.verify(user.hash, dto.password);
    if (!passwordMatches) {
      throw new BusinessErrorException({
        errorSubCode: ErrorSubCodes.INCORRECT_PASSWORD,
        errorFields: [{ fieldCode: 'password', errorMsg: 'Incorrect password' }],
      });
    }

    // Delegate session/token creation to JWTSessionService
    const tokens = await this.jwtSessionService.createSession(user);
    return tokens;
  }

  async logout(userId: number, rt: string): Promise<IStatusResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true, currentCompany: true },
    });

    // If user is not found, consider the session already ended.
    if (!user) {
      return { status: StatusType.SUCCESS };
    }

    await this.jwtSessionService.endSession(user, rt);
    return { status: StatusType.SUCCESS };
  }

  async refreshTokens(userId: number, rt: string): Promise<ITokensResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { sessions: true, currentCompany: true },
    });
    if (!user || !user.sessions) {
      throw new ForbiddenException('Session Expired');
    }

    await this.jwtSessionService.verifyRtMatch(user, rt);
    const tokens = await this.jwtSessionService.getTokens(user.id, user.currentCompanyId, user.email);
    await this.jwtSessionService.updateRtHash(user, rt, tokens.refresh_token);
    return tokens;
  }
}