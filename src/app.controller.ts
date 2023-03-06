import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/error')
  testeAlert() {
    throw new Error('teste');
  }

  @Get('slow')
  async slowRoute() {
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 100);
    });
    return 'ok';
  }
}
