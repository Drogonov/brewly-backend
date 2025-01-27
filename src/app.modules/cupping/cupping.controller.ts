import {
  Controller,
} from '@nestjs/common';

import { CuppingService } from './cupping.service';

@Controller('settings')
export class CuppingController {
  constructor(private cuppingService: CuppingService) {}

}
