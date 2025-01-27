import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC } from '../constants/constants';

export const Public = () => SetMetadata(IS_PUBLIC, true);
