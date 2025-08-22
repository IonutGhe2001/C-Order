import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  async list() {
    return { items: await this.users.list() };
  }

  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
