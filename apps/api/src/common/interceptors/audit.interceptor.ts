import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    // Attach request ID for traceability
    if (!request.headers['x-request-id']) {
      request.headers['x-request-id'] = uuidv4();
    }
    request.requestId = request.headers['x-request-id'];

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.setHeader('X-Request-Id', request.requestId);
        response.setHeader('X-Response-Time', `${Date.now() - start}ms`);
      }),
    );
  }
}
