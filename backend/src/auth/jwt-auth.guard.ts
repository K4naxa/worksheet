import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/auth/auth.controller';

// This guard uses the JWT strategy to protect routes
// It will automatically validate the JWT token in the request header
// and attach the user information to the request object if the token is valid.
// If the token is invalid or missing, it will throw an UnauthorizedException
// and prevent access to the protected route.

// if the route is marked as public using the @Public() decorator,
// it will bypass the JWT authentication and allow access to the route without a token.

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
