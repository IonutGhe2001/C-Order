import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('statuses')
export class StatusesController {
  constructor(private service: StatusesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body('name') name: string) {
    return this.service.create(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.service.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}