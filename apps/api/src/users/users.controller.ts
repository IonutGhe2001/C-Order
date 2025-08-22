import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  constructor(private users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list() { return { items: await this.users.list() }; }
  
  @Get('me')
  me(@Req() req: any) { return req.user; }
}
