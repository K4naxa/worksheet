import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

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

  @Public()
  @UseGuards(LocalAuthGuard) // This guard uses the LocalStrategy to validate user credentials
  @Post('login')
  login(@Request() req) {
    console.log('User logged in:', req.user);
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('User profile:', req.user);
    return req.user;
  }
}
