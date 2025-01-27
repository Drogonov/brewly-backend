import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types';
import { ACCESS_TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } from 'src/common/constants/constants';
import { ConfigurationService } from 'src/config/configuration.service';
import { ITokensResponse } from 'src/common/dto';
import * as argon from 'argon2';
import { User, Session } from '@prisma/client';

@Injectable()
export class JWTSessionService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigurationService
  ) { }

  async updateRtHash(user: User & { sessions: Session[] }, oldRt: string, newRt: string): Promise<void> {
    const currentSession = await this._findCurrentSesion(user, oldRt);    
    const hash = await argon.hash(newRt);
    
    await this.prisma.session.update({
      where: {
        id: currentSession.id
      },
      data: {
        hashedRt: hash
      }
    })
  }

  async endSession(user: User & { sessions: Session[] }, rt: string) {
    const currentSession = await this._findCurrentSesion(user, rt);

    await this.prisma.session.delete({
        where: {
          id: currentSession.id
        }
    });
  }

  async verifyRtMatch(user: User & { sessions: Session[] }, rt: string): Promise<Boolean> {
    const currentSession = await this._findCurrentSesion(user, rt);
    const rtMatches = await argon.verify(currentSession.hashedRt, rt);

    if (!rtMatches) {
      throw new ForbiddenException('Session expired.');
    } else {
      return rtMatches;
    }
  }

  async getTokens(userId: number, email: string): Promise<ITokensResponse> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
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
      access_token: at,
      refresh_token: rt,
    };
  }

  // MARK: - Private Methods

  async _findCurrentSesion(user: User & { sessions: Session[] }, rt: string): Promise<Session> {
    let currentSession: Session;

    for (const session of user.sessions) {
      const isMatch = await argon.verify(session.hashedRt, rt);
      if (isMatch) {
        currentSession = session;
      }
    }

    if (!currentSession) {
      throw new ForbiddenException('Cannot find the matching session.');
    } else {
      return currentSession;
    }
  }
}