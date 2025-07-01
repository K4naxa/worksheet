import {
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

import { SetMetadata } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
// This decorator can be used to mark routes as public, bypassing the JwtAuthGuard
export interface SigninDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Public endpoint for user login
  // This endpoint uses the LocalAuthGuard to validate user credentials (email and password)
  // LocalAuthGuard will check the credentials against the database
  // If the credentials are valid, it will return an user object
  // The user object will be passed to the login method of AuthService
  // The login method will generate an access token and a refresh token
  // The access token will be returned to the client
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Logout endpoint to invalidate the user's session
  // This endpoint will delete the refresh token from the database
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    console.log('User logged out:', req.user);
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('User profile requested:', req.user);
    // This endpoint returns the user's profile information
    // It uses the JwtAuthGuard to ensure the user is authenticated
    // The user information is extracted from the request object
    return req.user;
  }

  // Refresh token endpoint to get a new access token using the refresh token
  // This endpoint will check the validity of the refresh token
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshTokens(@Request() req: ExpressRequest) {
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    // We need the user ID from the request object to find the token from DB
    try {
      const decodedAccessToken: { sub: string } = this.authService[
        'jwtService'
      ].verify(accessToken, {
        ignoreExpiration: true, // Ignore expiration to get the user ID
      });

      const userId: string = decodedAccessToken.sub; // Extract user ID from the access token
      return this.authService.refreshToken(userId, refreshToken);
    } catch (e) {
      console.error('Error refreshing tokens:', e);
      throw new UnauthorizedException(
        'Invalid access token, or expired access token',
      );
    }
  }
}
