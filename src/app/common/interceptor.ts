import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    // Tag every log line with "LoggingInterceptor" as the context
    this.logger.setContext(LoggingInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();

    const { method, originalUrl, headers, body, rawBody } = request;

    // Instead of console.log, emit a Pino-friendly JSON line
    this.logger.info(
      {
        method,
        url: originalUrl,
        headers,
        body: Object.keys(body).length ? body : undefined,
        rawBody: rawBody ? rawBody : undefined,
      },
      'Request received'
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.info(
          { method, url: originalUrl, statusCode: context.switchToHttp().getResponse().statusCode, duration },
          'Response sent'
        );
      })
    );
  }
}