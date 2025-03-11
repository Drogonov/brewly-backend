import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types';
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from 'src/app.common/constants/constants';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { ITokensResponse } from 'src/app.common/dto';
import * as argon from 'argon2';
import { User, Session } from '@prisma/client';
import * as ms from 'ms';

@Injectable()
export class JWTSessionService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigurationService
  ) {}

  /**
   * Creates a new session by generating tokens, storing the hashed refresh token,
   * and cleaning up any expired sessions.
   */
  async createSession(user: User & { sessions?: Session[] }): Promise<ITokensResponse> {
    const tokens = await this.getTokens(user.id, user.currentCompanyId, user.email);
    const hashedRt = await argon.hash(tokens.refresh_token);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        hashedRt,
      },
    });

    // Cleanup expired sessions for the user
    await this._cleanupOldSessions(user.id);
    return tokens;
  }

  async updateRtHash(user: User & { sessions?: Session[] }, oldRt: string, newRt: string): Promise<void> {
    const currentSession = await this._findCurrentSession(user, oldRt);
    const newHash = await argon.hash(newRt);

    await this.prisma.session.update({
      where: { id: currentSession.id },
      data: { hashedRt: newHash },
    });
  }

  async endSession(user: User & { sessions?: Session[] }, rt: string): Promise<void> {
    const currentSession = await this._findCurrentSession(user, rt);
    await this.prisma.session.delete({
      where: { id: currentSession.id },
    });
  }

  async verifyRtMatch(user: User & { sessions?: Session[] }, rt: string): Promise<boolean> {
    const currentSession = await this._findCurrentSession(user, rt);
    const rtMatches = await argon.verify(currentSession.hashedRt, rt);

    if (!rtMatches) {
      throw new ForbiddenException('Session expired.');
    }
    return rtMatches;
  }

  async getTokens(userId: number, currentCompanyId: number, email: string): Promise<ITokensResponse> {
    const jwtPayload: JwtPayload = { userId, currentCompanyId, email };

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

  // Private Methods

  /**
   * Finds the session corresponding to the provided refresh token.
   */
  async _findCurrentSession(user: User & { sessions?: Session[] }, rt: string): Promise<Session> {
    // Ensure sessions exist and are non-empty
    if (!user || !user.sessions || user.sessions.length === 0) {
      throw new ForbiddenException('No active sessions found.');
    }
  
    for (const session of user.sessions) {
      if (await argon.verify(session.hashedRt, rt)) {
        return session;
      }
    }
    throw new ForbiddenException('Cannot find the matching session.');
  }

  /**
   * Deletes sessions older than the refresh token expiration period.
   */
  async _cleanupOldSessions(userId: number): Promise<void> {
    const expirationTimeMs = ms(REFRESH_TOKEN_EXPIRATION);
    const expiredThreshold = new Date(Date.now() - expirationTimeMs);

    await this.prisma.session.deleteMany({
      where: {
        userId,
        createdAt: { lt: expiredThreshold },
      },
    });
  }
}