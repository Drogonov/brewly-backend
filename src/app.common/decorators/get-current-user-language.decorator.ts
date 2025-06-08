import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/app.common/services/jwt-session/types';

export const GetCurrentUserLanguage = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.language;
  },
);
