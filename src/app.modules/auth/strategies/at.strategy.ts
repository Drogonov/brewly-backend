import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT } from 'src/app.services/common/constants/constants';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { JwtPayload } from 'src/app.services/jwt-session/types';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, JWT) {
  constructor(config: ConfigurationService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getAccessTokenSecret(),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
