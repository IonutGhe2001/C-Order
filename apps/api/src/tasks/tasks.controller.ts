import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { AuditLogService } from './audit-log.service';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService, private auditLog: AuditLogService) {}

  @Get()
  async list(@Query() q: any) { return { items: await this.tasks.list(q) }; }

  @Get(':id')
  get(@Param('id') id: string) { return this.tasks.get(id); }

  @Get(':id/audit')
  async audit(@Param('id') id: string) {
    return { items: await this.auditLog.list(id) };
  }

  @Post()
  create(@Body() body: any, @Req() req: any) { return this.tasks.create(body, req.user.sub); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.tasks.update(id, body); }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.tasks.addComment(id, req.user.sub, body.body);
  }
}
