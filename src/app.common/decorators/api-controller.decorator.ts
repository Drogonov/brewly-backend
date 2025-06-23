import { Controller } from '@nestjs/common';

export function ApiController(path: string): ClassDecorator {
  // prefix every path with `api/`
  return Controller(`api/${path}`);
}