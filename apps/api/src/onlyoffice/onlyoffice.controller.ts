import { Controller, Post, Query, Body } from '@nestjs/common';
import { OnlyOfficeService } from './onlyoffice.service';

@Controller('onlyoffice')
export class OnlyOfficeController {
  constructor(private oo: OnlyOfficeService) {}

  @Post('callback')
  callback(@Query('attId') attId: string, @Body() body: any) {
    return this.oo.handleCallback(body, attId);
  }
}