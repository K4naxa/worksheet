import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This guard uses the LocalStrategy to authenticate users based on email and password
// It will automatically validate the user credentials in the request body
// and attach the user information to the request object if the credentials are valid.

// The LocalStrategy is typically used for username/password authentication (endpoints like login).
// If the credentials are invalid, it will throw an UnauthorizedException
// and prevent access to the protected route.

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
