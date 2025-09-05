import { Controller, Post, Query, Body, Header, HttpCode } from '@nestjs/common';
import { OnlyOfficeService } from './onlyoffice.service';
// import { Public } from '../auth/public.decorator'; // doar dacă ai guard global

@Controller('onlyoffice')
export class OnlyOfficeController {
  constructor(private oo: OnlyOfficeService) {}

  @Post('callback')
  @HttpCode(200)                          // <- status fix 200, nu 201
  @Header('Content-Type', 'application/json')
  // @Public()                             // <- activează dacă ai AuthGuard global
  async callback(@Query('attId') attId: string, @Body() body: any) {
    return await this.oo.handleCallback(body, attId) ?? { error: 0 };
  }
}
