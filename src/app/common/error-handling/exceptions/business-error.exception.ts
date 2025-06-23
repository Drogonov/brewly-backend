import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponseDto } from '../../dto';

export class BusinessErrorException extends HttpException {
  constructor(
    private readonly errorResponseMo: ErrorResponseDto,
  ) {
    super(
      { errorResponseMo },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}