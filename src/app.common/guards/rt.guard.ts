import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH } from '../constants/constants';

export class RtGuard extends AuthGuard(JWT_REFRESH) {
  constructor() {
    super();
  }
}
