import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { JWT_REFRESH } from 'src/app.common/constants/constants';
import { ConfigurationService } from 'src/app.common/services/config/configuration.service';
import { JwtPayload, JwtPayloadWithRt } from 'src/app.common/services/jwt-session/types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, JWT_REFRESH) {
  constructor(config: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getRefreshTokenSecret(),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRt {
    const refreshToken = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
