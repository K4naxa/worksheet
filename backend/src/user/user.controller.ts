import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Registration } from 'src/types/import.types';
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

  @Post('register')
  registerUser(
    @AuthenticatedUser() user: KeycloakProfile,
    @Body() body: Registration,
  ) {
    return this.userService.registerUser(user, body);
  }

  @Delete('profile')
  async deleteUserProfile(@AuthenticatedUser() user: KeycloakProfile) {
    const userId = user.sub;
    const userEmail = user.email;

    console.log(
      `Received request to delete profile for user ID: ${userId}, email: ${userEmail}`,
    );

    await this.userService.deleteUser(userId);

    return {
      message:
        'User profile and all associated data have been successfully deleted.',
    };
  }
}
