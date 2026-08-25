import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';
import { GoogleOAuthGuard } from './google-oauth.guard';

const COOKIE_NAME = 'jq_token';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleLogin(): void {
    // Redirect to Google is handled by the guard.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    const user = req.user as User;
    const token = this.auth.signToken(user);

    // Extension flow: `state` is the extension's chromiumapp.org redirect URL —
    // hand the token back via the fragment (no cookie).
    const state = req.query.state as string | undefined;
    if (state && /^https:\/\/[a-z]+\.chromiumapp\.org\//.test(state)) {
      res.redirect(`${state}#token=${token}`);
      return;
    }

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get<string>('NODE_ENV') === 'production',
      maxAge: THIRTY_DAYS_MS,
    });
    res.redirect(this.config.get<string>('FRONTEND_URL')!);
  }

  @Get('me')
  me(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      inviteCode: user.inviteCode,
    };
  }

  @Post('logout')
  logout(@Res() res: Response): void {
    res.clearCookie(COOKIE_NAME);
    res.json({ ok: true });
  }

  // Used by the extension (B6): the signed-in web session exchanges for a
  // Bearer token the extension stores.
  @Get('extension-token')
  extensionToken(@CurrentUser() user: User) {
    return { token: this.auth.signToken(user) };
  }
}
