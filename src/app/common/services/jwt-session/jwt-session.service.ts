import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types';
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from 'src/app/common/constants/constants';
import { ConfigurationService } from 'src/app/common/services/config/configuration.service';
import { ITokensResponse } from 'src/app/common/dto';
import * as argon from 'argon2';
import { User, Session, SessionType, PrismaClient } from '@prisma/client';
import ms from 'ms';
import { ErrorHandlingService } from 'src/app/common/error-handling/error-handling.service';
import { ErrorsKeys } from 'src/app/common/localization/generated';

@Injectable()
export class JWTSessionService {
  constructor(
    @Inject(PrismaClient) private readonly prisma: PrismaClient,
    private jwtService: JwtService,
    private config: ConfigurationService,
    private errorHandlingService: ErrorHandlingService
  ) { }

  /**
   * Creates a new session by generating tokens, storing the hashed refresh token,
   * and cleaning up any expired sessions.
   */
  async createSession(user: User & { sessions?: Session[] }, language: string): Promise<ITokensResponse> {
    const tokens = await this.getTokens(user.id, user.currentCompanyId, user.email, language);
    const hashedRt = await argon.hash(tokens.refresh_token);

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        hashedRt,
        type: SessionType.IOS
      },
    });

    // Cleanup expired sessions for the user
    await this.cleanupOldSessions(user.id, session.id, session.type);
    return tokens;
  }

  /**
   * Updates the refresh token hash for an active session.
   */
  async updateRtHash(user: User & { sessions?: Session[] }, oldRt: string, newRt: string): Promise<void> {
    const currentSession = await this.findCurrentSession(user, oldRt);
    const newHash = await argon.hash(newRt);

    await this.prisma.session.update({
      where: { id: currentSession.id },
      data: { hashedRt: newHash },
    });
  }

  /**
   * Ends the user session by deleting the corresponding session record.
   */
  async endSession(user: User & { sessions?: Session[] }, rt: string): Promise<void> {
    const currentSession = await this.findCurrentSession(user, rt);

    await this.prisma.session.delete({
      where: { id: currentSession.id },
    });
  }

  /**
   * Verifies that the provided refresh token matches the stored hashed token.
   */
  async verifyRtMatch(user: User & { sessions?: Session[] }, rt: string): Promise<boolean> {
    const currentSession = await this.findCurrentSession(user, rt);
    const rtMatches = await argon.verify(currentSession.hashedRt, rt);

    if (!rtMatches) {
      // Throws a localized ForbiddenException (status 403)
      throw await this.errorHandlingService.getForbiddenError(ErrorsKeys.SESSION_EXPIRED);
    }
    return rtMatches;
  }

  /**
   * Generates access and refresh tokens.
   */
  async getTokens(userId: number, currentCompanyId: number, email: string, language: string): Promise<ITokensResponse> {
    const jwtPayload: JwtPayload = { userId, currentCompanyId, email, language };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.getAccessTokenSecret(),
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.getRefreshTokenSecret(),
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // MARK: Private Methods

  /**
   * Finds the session corresponding to the provided refresh token.
   * Throws a localized ForbiddenException if no session is found.
   */
  private async findCurrentSession(user: User & { sessions?: Session[] }, rt: string): Promise<Session> {
    if (!user || !user.sessions || user.sessions.length === 0) {
      throw await this.errorHandlingService.getForbiddenError(ErrorsKeys.SESSION_EXPIRED);
    }

    for (const session of user.sessions) {
      if (await argon.verify(session.hashedRt, rt)) {
        return session;
      }
    }
    throw await this.errorHandlingService.getForbiddenError(ErrorsKeys.SESSION_EXPIRED);
  }

  /**
   * Deletes sessions older than the refresh token expiration period.
   */
  private async cleanupOldSessions(
    userId: number,
    currentSessionId: number,
    currentSessionType: SessionType
  ): Promise<void> {
    const expirationTimeMs = ms(REFRESH_TOKEN_EXPIRATION);
    const expiredThreshold = new Date(Date.now() - expirationTimeMs);

    await this.prisma.session.deleteMany({
      where: {
        userId,
        createdAt: { lt: expiredThreshold },
      },
    });

    await this.prisma.session.deleteMany({
      where: {
        id: { not: currentSessionId },
        userId,
        type: currentSessionType,
      }
    })
  }
}