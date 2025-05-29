import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.originalUrl;
        console.log(`[${method}] ${url} - Request received`);
        return next.handle().pipe(
            tap(() => console.log(`[${method}] ${url} - Response sent - ${Date.now() - now}ms`)),
            tap(() => console.log(request)),
        );
    }
}