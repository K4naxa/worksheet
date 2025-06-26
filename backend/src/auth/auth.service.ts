import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string } | null> {
    const user = await this.userService.findByEmail(email);

    // If user not found or password is incorrect, throw an UnauthorizedException
    if (
      !user ||
      !(await this.userService.validatePassword(pass, user.password))
    ) {
      throw new UnauthorizedException('Väärä sähköposti tai salasana');
    }

    // If credentials are valid, return user data (excluding password)
    const { password, ...result } = user;

    // Sign the JWT token with user data
    return {
      access_token: await this.jwtService.signAsync(
        {
          sub: result.id,
          user: result,
        },
        {
          secret: jwtConstants.secret,
        },
      ),
    };
  }
}
