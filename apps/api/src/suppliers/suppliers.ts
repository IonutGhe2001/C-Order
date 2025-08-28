import { Controller, Get, Param, Query, Body, Post, Patch, UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private suppliers: SuppliersService) {}

  @Get()
  async list(@Query() q: any) {
    return { items: await this.suppliers.list(q) };
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.suppliers.get(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.suppliers.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.suppliers.update(id, body);
  }
}