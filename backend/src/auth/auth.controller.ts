import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

export interface SigninDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // endpoint to login a user
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signinDto: SigninDto) {
    return this.authService.signIn(signinDto.email, signinDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // Return the user profile from the request object
    return req.user;
  }
}
