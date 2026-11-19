import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
} from '@nestjs/common';

@Catch(ConflictException)
export class ConflictExceptionFilter<
  T extends ConflictException,
> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();

    response.status(exception.getStatus()).json({
      data: exception.getResponse(),
    });
  }
}
