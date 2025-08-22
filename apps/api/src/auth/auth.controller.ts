
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LocalAuthGuard } from './local.strategy';
import { JwtAuthGuard } from './jwt.strategy';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = this.auth.tokens(req.user);
    const domain = process.env.COOKIE_DOMAIN || 'localhost';
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax', domain });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax', domain });
    return { ok: true };
  }

  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refresh = req.cookies?.refreshToken;
    if (!refresh) return { ok: false };
    try {
      const payload: any = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET as string);
      const { accessToken } = this.auth.tokens({ id: payload.sub, role: 'VIEWER', email: '' });
      const domain = process.env.COOKIE_DOMAIN || 'localhost';
      res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'lax', domain });
      return { ok: true };
    } catch { return { ok: false }; }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const domain = process.env.COOKIE_DOMAIN || 'localhost';
    res.clearCookie('accessToken', { domain });
    res.clearCookie('refreshToken', { domain });
    return { ok: true };
  }
}
