import { Controller, Get } from '@nestjs/common';
import { Unprotected } from 'nest-keycloak-connect'; // To mark public endpoints
import { AuthenticatedUser } from 'nest-keycloak-connect'; // Correct decorators
import { KeyCloakProfile } from 'nest-keycloak-connect';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Get('profile')
  getProfile(@AuthenticatedUser() user: KeycloakProfile) {
    // The `AuthenticatedUser` decorator injects the decoded token payload.
    // KeycloakProfile provides typed access to standard claims.
    console.log('User from Keycloak token:', user);
    return {
      id: user.sub,
      email: user.email,
      firstName: user.given_name,
      lastName: user.family_name,
    };
  }
}
