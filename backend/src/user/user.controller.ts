import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { KeycloakProfile } from 'src/types/keycloack.types';
import { UserService } from 'src/user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@AuthenticatedUser() user: KeycloakProfile) {
    return this.userService.getProfile(user);
  }

  @Get('registration-status')
  getRegistrationStatus(@AuthenticatedUser() user: KeycloakProfile) {
    return this.userService.getRegistrationStatus(user);
  }

  @Post('complete-registration')
  completeRegistration(
    @AuthenticatedUser() user: KeycloakProfile,
    @Body() body: any,
  ) {
    return this.userService.completeRegistration(user, body);
  }
}
