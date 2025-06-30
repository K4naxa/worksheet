import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

// The LocalStrategy is used for username/password authentication eg. login endpoint.
// It extends the PassportStrategy class from the @nestjs/passport package.

// It validates the user credentials provided in the request body
// and attaches the user information to the request object if valid.
// If the credentials are invalid, it throws an UnauthorizedException
// and prevents access to the protected route.
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Use 'email' as the username field
      passwordField: 'password', // Use 'password' as the password field
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
