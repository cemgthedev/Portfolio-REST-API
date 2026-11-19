import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export class AddHeaderInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    console.log(`Request: `, request);

    const response = context.switchToHttp().getResponse();

    response.setHeader('X-Custom-Header', 'Custom header with interceptor');

    return next.handle();
  }
}
