import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import type { Request } from 'express';

// Forwards an extension's `redirect_uri` (its chromiumapp.org URL) through the
// OAuth `state` param so the callback can hand the token back to the extension
// instead of setting the web cookie. Web logins pass no redirect_uri → no state.
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext): IAuthModuleOptions {
    const req = context.switchToHttp().getRequest<Request>();
    const redirectUri = req.query?.redirect_uri as string | undefined;
    return redirectUri ? { state: redirectUri } : {};
  }
}
