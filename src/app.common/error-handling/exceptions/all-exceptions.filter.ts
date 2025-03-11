import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { LocalizationStringsService } from 'src/app.common/services/localization-strings-service';
import { IErrorResponse } from 'src/app.common/dto';
import { ErrorHandlingService } from 'src/app.common/error-handling/error-handling.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(
    private readonly localizationStringsService: LocalizationStringsService,
    private readonly errorHandlingService: ErrorHandlingService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: IErrorResponse = {
      errorMsg: 'Internal server error',
      errorSubCode: 'INTERNAL_SERVER_ERROR',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        errorResponse.errorMsg = res;
      } else if (typeof res === 'object') {
        errorResponse = { ...errorResponse, ...res };
      }
    }

    // Use error handling service to get localized error message if available.
    if (errorResponse.errorSubCode) {
      const localizedMessage = await this.errorHandlingService.getLocalizedErrorMessage(errorResponse.errorSubCode);
      if (localizedMessage) {
        errorResponse.errorMsg = localizedMessage;
      }
    }

    // Log the error for monitoring purposes.
    this.logger.error(`Error occurred: ${JSON.stringify(errorResponse)}`, exception instanceof Error ? exception.stack : '');

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorResponse,
    });
  }
}