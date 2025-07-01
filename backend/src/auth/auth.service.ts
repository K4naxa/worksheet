import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken, User } from '@prisma/client'; // Adjust the import path based on your project structure
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

// Request Validation DTO
// This DTO is used to validate the request body for login
export class LoginRequestDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    console.log('Validating user with email:', email);
    const user = await this.userService.findByEmail(email);
    // If user not found or password is incorrect, return null
    if (
      !user ||
      !(await this.userService.validatePassword(pass, user.password))
    ) {
      console.log('INVALID credentials for user:', email);
      return null;
    }
    // If credentials are valid, return user data (excluding password)
    const { password, ...result } = user;
    return result;
  }

  async login(user: Omit<User, 'password'>): Promise<{
    access_token: string;
    refresh_token: string;
    user: { id: string; email: string };
  }> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Generate and store the refresh token
    const { refreshToken } = await this.generateAndStoreRefreshToken(user.id);

    console.log('User logged in with ID:', user.email);
    return {
      access_token: accessToken,
      refresh_token: refreshToken, // Return the raw token
      user: { id: user.id, email: user.email },
    };
  }

  private async generateAndStoreRefreshToken(userId: string): Promise<{
    refreshToken: string;
    storedToken: { id: string; hashedToken: string; expiresAt: Date };
  }> {
    // Generate a random refresh token
    const refreshToken = Buffer.from(`${userId}-${Date.now()}`).toString(
      'base64',
    );
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const storedToken = await this.prisma.refreshToken.create({
      data: {
        userId,
        hashedToken,
        expiresAt,
      },
    });

    console.log('User succesfully logged in with ID:', userId);
    console.log('Returned refresh token:', refreshToken);
    return { refreshToken, storedToken };
  }

  async refreshToken(userId: string, providedRefreshToken: string) {
    // Fetch all refresh tokens for the user
    const userTokens: RefreshToken[] = await this.prisma.refreshToken.findMany({
      where: { userId },
    });

    // If no tokens found, deny access
    if (!userTokens || !userTokens.length) {
      throw new ForbiddenException(
        'Access Denied. No refresh tokens found for user.',
      );
    }

    // Check if the provided refresh token matches any stored token
    // This is a security measure to ensure the provided token is valid
    let validTokenRecord: RefreshToken | null = null;
    for (const tokenRecord of userTokens) {
      const isMatch = await bcrypt.compare(
        providedRefreshToken,
        tokenRecord.hashedToken,
      );
      if (isMatch) {
        validTokenRecord = tokenRecord;
        break;
      }
    }

    // Security measure: If an invalid token is used, it might be compromised.
    // Invalidate all tokens for this user.
    if (!validTokenRecord) {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
      throw new ForbiddenException('Access Denied. Invalid refresh token.');
    }

    // Check if the token is expired
    // If the token is expired, delete it and deny access
    if (new Date() > validTokenRecord.expiresAt) {
      await this.prisma.refreshToken.delete({
        where: { id: validTokenRecord.id },
      });
      throw new ForbiddenException('Access Denied. Refresh token expired.');
    }

    // --- Token Rotation ---
    // This is a security measure to prevent replay attacks.
    // After a successful refresh, the used token is deleted and a new one is issued.
    // If the token is valid, proceed to issue a new access token and refresh token
    // This ensures that the same refresh token cannot be used again.

    // Delete the used token
    await this.prisma.refreshToken.delete({
      where: { id: validTokenRecord.id },
    });

    // Issue a new pair of tokens
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { email: user.email, sub: user.id };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const { refreshToken: newRefreshToken } =
      await this.generateAndStoreRefreshToken(userId);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken, // Return the new refresh token
    };
  }

  async logout(userId: string) {
    // Invalidate all refresh tokens for the user
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
    return { message: 'Logout successful from all devices.' };
  }
}
