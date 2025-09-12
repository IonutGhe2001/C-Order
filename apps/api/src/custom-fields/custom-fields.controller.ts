import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private service: CustomFieldsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body('name') name: string, @Body('label') label: string) {
    return this.service.create(name, label);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('label') label: string) {
    return this.service.update(id, label);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}