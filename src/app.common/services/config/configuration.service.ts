import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigurationService {
    constructor(private configService: ConfigService) { }

    getEnv(): string {
        return this.configService.get('env');
      }

    getDatabaseURL(): string {
        return this.configService.get('db.url');;
    }

    getAppPort(): string {
        return this.configService.get('app.port');;
    }

    getEmailAPI():string {
        return this.configService.get('app.emailAPI')
    }

    getAccessTokenSecret():string {
        return this.configService.get('jwt.at')
    }

    getRefreshTokenSecret():string {
        return this.configService.get('jwt.rt')
    }

    getOtpDevCode(): string {
        return this.configService.get('otp.dev') || "666666";
    }
}