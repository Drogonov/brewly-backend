import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const now = Date.now();
      const request = context.switchToHttp().getRequest();
  
      // Basic info
      console.log(`\n[${request.method}] ${request.originalUrl} — Request received`);
  
      // Log headers
      console.log('Headers:', JSON.stringify(request.headers, null, 2));
  
      // Log the parsed body object
      console.log('Parsed body keys:', Object.keys(request.body));
      console.dir(request.body, { depth: null });
  
      // If you’ve set up the raw-body middleware (see below), you’ll also get the raw JSON here:
      if (request.rawBody) {
        console.log('Raw JSON body:', request.rawBody);
      }
  
      return next.handle().pipe(
        tap(() => {
          console.log(
            `[${request.method}] ${request.originalUrl} — Response sent (${Date.now() -
              now}ms)\n`,
          );
        }),
      );
    }
  }