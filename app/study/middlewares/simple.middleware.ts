import { NestMiddleware } from '@nestjs/common';

export class SimpleMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    console.log(`Request: `, req);

    console.log(`Response: `, res);
  }
}
