import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, Patch, BadRequestException } from '@nestjs/common';
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

  private parseTaskBody(body: any) {
    const {
      status,
      priority,
      assignees,
      supplierId,
      dueDate,
      amount,
      currency,
      title,
      description,
      orderDate,
      orderReceivedDate,
      orderNumber,
      authority,
      orderType,
      productsReceivedDate,
      deliveryDate,
    } = body;

    if (assignees !== undefined) {
      if (!Array.isArray(assignees)) throw new BadRequestException('assignees must be an array');
      assignees.forEach((id) => {
        if (typeof id !== 'string') throw new BadRequestException('assignees must be string ids');
      });
    }

    const parseDate = (value: any, field: string) => {
      if (value === undefined) return undefined;
      const d = new Date(value);
      if (isNaN(d.getTime())) throw new BadRequestException(`${field} must be a valid date`);
      return d;
    };

    return {
      status,
      priority,
      assignees,
      supplierId,
      dueDate: parseDate(dueDate, 'dueDate'),
      amount,
      currency,
      title,
      description,
      orderDate: parseDate(orderDate, 'orderDate'),
      orderReceivedDate: parseDate(orderReceivedDate, 'orderReceivedDate'),
      orderNumber,
      authority,
      orderType,
      productsReceivedDate: parseDate(productsReceivedDate, 'productsReceivedDate'),
      deliveryDate: parseDate(deliveryDate, 'deliveryDate'),
    };
  }

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.tasks.create(this.parseTaskBody(body), req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasks.update(id, this.parseTaskBody(body));
  }

  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.tasks.addComment(id, req.user.sub, body.body);
  }
}
