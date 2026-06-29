import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { LoginInputSchema, RegisterInputSchema } from '@petnalia/types';

import { Public } from '../../shared/decorators/public.decorator';
import { AuthService } from './auth.service';

const REFRESH_COOKIE = 'petnalia_refresh';
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1_000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = RegisterInputSchema.parse(body);
    const { tokens, rawRefreshToken } = await this.authService.register(dto);
    this.setRefreshCookie(res, rawRefreshToken);
    return tokens;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = LoginInputSchema.parse(body);
    const { tokens, rawRefreshToken } = await this.authService.login(dto);
    this.setRefreshCookie(res, rawRefreshToken);
    return tokens;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException();

    const { tokens, rawRefreshToken } = await this.authService.refresh(raw);
    this.setRefreshCookie(res, rawRefreshToken);
    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const raw = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    if (raw) await this.authService.logout(raw);
    res.clearCookie(REFRESH_COOKIE, { path: '/v1/auth' });
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      path: '/v1/auth',
      maxAge: REFRESH_TTL_MS,
    });
  }
}
