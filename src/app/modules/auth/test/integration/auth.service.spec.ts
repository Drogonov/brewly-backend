import { Role, SessionType, User } from '@prisma/client';
import * as argon from 'argon2';
import { PinoLogger } from 'nestjs-pino';
import { ITokensResponse } from 'src/app/common/dto';
import { ErrorHandlingService } from 'src/app/common/error-handling/error-handling.service';
import { ErrorFieldCode } from 'src/app/common/error-handling/exceptions';
import {
  BusinessErrorKeys,
  ErrorsKeys,
  ValidationErrorKeys,
} from 'src/app/common/localization/generated';
import { ConfigurationService } from 'src/app/common/services/config/configuration.service';
import { JWTSessionService } from 'src/app/common/services/jwt-session/jwt-session.service';
import { MailService } from 'src/app/common/services/mail/mail.service';
import { PrismaService } from 'src/app/common/services/prisma/prisma.service';
import { AuthService } from '../../auth.service';
import { StatusType } from '../../dto';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

const authRequest = {
  email: 'test@gmail.com',
  password: 'super-secret-password',
  language: 'en',
};

const tokens: ITokensResponse = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
};

const testUser: User = {
  id: 1,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
  userName: null,
  userImageURL: null,
  email: authRequest.email,
  about: null,
  hash: 'password-hash',
  otpHash: 'otp-hash',
  otpExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
  isVerificated: true,
  currentCompanyId: 2,
};

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: {
    $transaction: jest.Mock;
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    company: { create: jest.Mock };
    userToCompanyRelation: { create: jest.Mock };
  };
  let jwtSessionService: {
    createSession: jest.Mock;
    endSession: jest.Mock;
    verifyRtMatch: jest.Mock;
    getTokens: jest.Mock;
    updateRtHash: jest.Mock;
  };
  let mailService: { sendOtpEmail: jest.Mock };
  let configService: { getEnv: jest.Mock; getOtpDevCode: jest.Mock };
  let errorHandlingService: {
    getBusinessError: jest.Mock;
    getForbiddenError: jest.Mock;
    getValidationError: jest.Mock;
  };
  let logger: { setContext: jest.Mock };

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
      user: {
        create: jest.fn().mockResolvedValue(testUser),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue(testUser),
      },
      company: {
        create: jest.fn().mockResolvedValue({ id: 2 }),
      },
      userToCompanyRelation: {
        create: jest.fn().mockResolvedValue({ id: 3 }),
      },
    };
    prisma.$transaction.mockImplementation(async (callback) =>
      callback(prisma),
    );

    jwtSessionService = {
      createSession: jest.fn().mockResolvedValue(tokens),
      endSession: jest.fn().mockResolvedValue(undefined),
      verifyRtMatch: jest.fn().mockResolvedValue(true),
      getTokens: jest.fn().mockResolvedValue(tokens),
      updateRtHash: jest.fn().mockResolvedValue(undefined),
    };
    mailService = { sendOtpEmail: jest.fn().mockResolvedValue(undefined) };
    configService = {
      getEnv: jest.fn().mockReturnValue('development'),
      getOtpDevCode: jest.fn().mockReturnValue('666666'),
    };

    const businessError = Object.assign(new Error('business error'), {
      status: 422,
    });
    const forbiddenError = Object.assign(new Error('forbidden error'), {
      status: 403,
    });
    const validationError = Object.assign(new Error('validation error'), {
      status: 422,
    });
    errorHandlingService = {
      getBusinessError: jest.fn().mockResolvedValue(businessError),
      getForbiddenError: jest.fn().mockResolvedValue(forbiddenError),
      getValidationError: jest.fn().mockResolvedValue(validationError),
    };
    logger = { setContext: jest.fn() };

    (argon.hash as jest.Mock)
      .mockReset()
      .mockResolvedValueOnce('password-hash')
      .mockResolvedValueOnce('otp-hash');
    (argon.verify as jest.Mock).mockReset().mockResolvedValue(true);

    authService = new AuthService(
      prisma as unknown as PrismaService,
      jwtSessionService as unknown as JWTSessionService,
      mailService as unknown as MailService,
      configService as unknown as ConfigurationService,
      errorHandlingService as unknown as ErrorHandlingService,
      logger as unknown as PinoLogger,
    );
  });

  describe('signUpLocal', () => {
    it('creates a user, personal company and owner relation', async () => {
      await expect(authService.signUpLocal(authRequest)).resolves.toEqual({
        status: StatusType.SUCCESS,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: authRequest.email,
          hash: 'password-hash',
          otpHash: 'otp-hash',
          isVerificated: false,
        }),
      });
      expect(prisma.company.create).toHaveBeenCalledWith({
        data: { companyName: 'Personal', isPersonal: true },
      });
      expect(prisma.userToCompanyRelation.create).toHaveBeenCalledWith({
        data: { userId: testUser.id, companyId: 2, role: Role.OWNER },
      });
      expect(mailService.sendOtpEmail).not.toHaveBeenCalled();
    });

    it('maps OTP delivery failures to a business error', async () => {
      configService.getEnv.mockReturnValue('production');
      mailService.sendOtpEmail.mockRejectedValue(new Error('mail unavailable'));

      await expect(authService.signUpLocal(authRequest)).rejects.toMatchObject({
        status: 422,
      });
      expect(errorHandlingService.getBusinessError).toHaveBeenCalledWith(
        BusinessErrorKeys.CANT_DELIVER_VERIFICATION_EMAIL,
        { email: `"${authRequest.email}"` },
      );
    });
  });

  describe('verifyOTP', () => {
    it('verifies the OTP, clears it and creates a session', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...testUser,
        isVerificated: false,
      });
      prisma.user.update.mockResolvedValue(testUser);

      await expect(
        authService.verifyOTP({
          email: authRequest.email,
          otp: '666666',
          language: authRequest.language,
        }),
      ).resolves.toEqual(tokens);

      expect(argon.verify).toHaveBeenCalledWith('otp-hash', '666666');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: authRequest.email },
        data: { otpHash: null, isVerificated: true, otpExpiresAt: null },
      });
      expect(jwtSessionService.createSession).toHaveBeenCalledWith(
        testUser,
        authRequest.language,
      );
    });
  });

  describe('signInLocal', () => {
    it('returns tokens for a verified user with a valid password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...testUser,
        sessions: [],
        currentCompany: { id: 2 },
      });

      await expect(authService.signInLocal(authRequest)).resolves.toEqual(
        tokens,
      );
      expect(argon.verify).toHaveBeenCalledWith(
        testUser.hash,
        authRequest.password,
      );
      expect(jwtSessionService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ id: testUser.id }),
        authRequest.language,
      );
    });

    it('returns a validation error when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.signInLocal(authRequest)).rejects.toMatchObject({
        status: 422,
      });
      expect(errorHandlingService.getValidationError).toHaveBeenCalledWith([
        {
          errorFieldsCode: ErrorFieldCode.email,
          validationErrorKey: ValidationErrorKeys.USER_DOESNT_EXIST,
        },
      ]);
    });

    it('rejects an unverified user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...testUser,
        isVerificated: false,
      });

      await expect(authService.signInLocal(authRequest)).rejects.toMatchObject({
        status: 422,
      });
      expect(errorHandlingService.getBusinessError).toHaveBeenCalledWith(
        BusinessErrorKeys.USER_NOT_VERIFIED,
      );
    });

    it('returns a validation error for an incorrect password', async () => {
      prisma.user.findUnique.mockResolvedValue(testUser);
      (argon.verify as jest.Mock).mockResolvedValue(false);

      await expect(authService.signInLocal(authRequest)).rejects.toMatchObject({
        status: 422,
      });
      expect(errorHandlingService.getValidationError).toHaveBeenCalledWith([
        {
          errorFieldsCode: ErrorFieldCode.password,
          validationErrorKey: ValidationErrorKeys.INCORRECT_PASSWORD,
        },
      ]);
    });
  });

  describe('logout', () => {
    it('succeeds when the user no longer exists', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.logout(404, tokens.refresh_token),
      ).resolves.toEqual({
        status: StatusType.SUCCESS,
      });
      expect(jwtSessionService.endSession).not.toHaveBeenCalled();
    });

    it('ends the matching session', async () => {
      const userWithSessions = {
        ...testUser,
        sessions: [
          {
            id: 7,
            userId: testUser.id,
            hashedRt: 'hashed-refresh-token',
            type: SessionType.IOS,
            createdAt: testUser.createdAt,
            updatedAt: testUser.updatedAt,
          },
        ],
      };
      prisma.user.findUnique.mockResolvedValue(userWithSessions);

      await expect(
        authService.logout(testUser.id, tokens.refresh_token),
      ).resolves.toEqual({ status: StatusType.SUCCESS });
      expect(jwtSessionService.endSession).toHaveBeenCalledWith(
        userWithSessions,
        tokens.refresh_token,
      );
    });
  });

  describe('refreshTokens', () => {
    it('rejects a missing user as an expired session', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.refreshTokens(404, tokens.refresh_token, 'en'),
      ).rejects.toMatchObject({ status: 403 });
      expect(errorHandlingService.getForbiddenError).toHaveBeenCalledWith(
        ErrorsKeys.SESSION_EXPIRED,
      );
    });

    it('rotates the matching refresh-token session', async () => {
      const rotatedTokens: ITokensResponse = {
        access_token: 'rotated-access-token',
        refresh_token: 'rotated-refresh-token',
      };
      const userWithSessions = {
        ...testUser,
        sessions: [{ id: 7, hashedRt: 'hashed-refresh-token' }],
        currentCompany: { id: 2 },
      };
      prisma.user.findUnique.mockResolvedValue(userWithSessions);
      jwtSessionService.getTokens.mockResolvedValue(rotatedTokens);

      await expect(
        authService.refreshTokens(
          testUser.id,
          tokens.refresh_token,
          authRequest.language,
        ),
      ).resolves.toEqual(rotatedTokens);

      expect(jwtSessionService.verifyRtMatch).toHaveBeenCalledWith(
        userWithSessions,
        tokens.refresh_token,
      );
      expect(jwtSessionService.getTokens).toHaveBeenCalledWith(
        testUser.id,
        testUser.currentCompanyId,
        testUser.email,
        authRequest.language,
      );
      expect(jwtSessionService.updateRtHash).toHaveBeenCalledWith(
        userWithSessions,
        tokens.refresh_token,
        rotatedTokens.refresh_token,
      );
    });
  });
});
