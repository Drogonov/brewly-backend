import { Module } from '@nestjs/common';
import { ConfigurationService } from 'src/app.services/config/configuration.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, ConfigurationService],
})
export class UserModule {}