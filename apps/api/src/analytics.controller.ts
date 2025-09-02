import { Controller, Post, Body } from '@nestjs/common';

@Controller('analytics')
export class AnalyticsController {
  @Post()
  record(@Body() _body: any) {
    return { ok: true };
  }
}