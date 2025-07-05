// src/keycloak-admin/keycloak-admin.service.ts

import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { jwtDecode } from 'jwt-decode';

// Define a type for the decoded JWT payload for better type safety
interface DecodedAdminToken {
  exp: number; // Expiration time in seconds since epoch
  iat: number; // Issued at time in seconds since epoch
}

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private axiosInstance: AxiosInstance;
  private adminAccessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.axiosInstance = axios.create({
      baseURL: `${this.configService.get('KEYCLOAK_AUTH_URL')}/admin/realms/${this.configService.get('KEYCLOAK_REALM')}`,
    });

    // Set up the request interceptor to automatically add the admin token
    // and refresh it if necessary before each request
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (!this.isAdminTokenValid()) {
        await this.getAdminAccessToken();
      }
      config.headers.Authorization = `Bearer ${this.adminAccessToken}`;
      return config;
    });
  }

  /**
   * Fetches a new admin access token using nestjs client credentials and stores it along with its expiry.
   */
  private async getAdminAccessToken(): Promise<void> {
    try {
      console.log('Fetching new Keycloak admin access token...');
      const tokenUrl = `${this.configService.get('KEYCLOAK_AUTH_URL')}/realms/${this.configService.get('KEYCLOAK_REALM')}/protocol/openid-connect/token`;

      const params = new URLSearchParams();
      params.append(
        'client_id',
        this.configService.get('KEYCLOAK_CLIENT_ID') as string,
      );
      params.append(
        'client_secret',
        this.configService.get('KEYCLOAK_CLIENT_SECRET') as string,
      );
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(tokenUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const newAccessToken = response.data.access_token;

      // If the access token is not present, throw an error
      if (!newAccessToken) {
        throw new Error('No access_token in Keycloak response');
      }

      this.adminAccessToken = newAccessToken;

      // Decode the new token to get its expiration time
      if (this.adminAccessToken) {
        const decodedToken = jwtDecode<DecodedAdminToken>(
          this.adminAccessToken,
        );

        // The `exp` claim is in seconds, convert it to milliseconds
        this.tokenExpiresAt = decodedToken.exp * 1000;
      }

      console.log(`✅ Successfully obtained Keycloak admin token. `);
    } catch (error) {
      console.error(
        '❌ Failed to get Keycloak admin access token',
        error.response?.data || error.message,
      );
      // Clear out old token info on failure
      this.adminAccessToken = null;
      this.tokenExpiresAt = null;
      throw new InternalServerErrorException(
        'Could not authenticate with Keycloak as admin',
      );
    }
  }

  /**
   * Checks if the stored admin token exists and has not expired.
   * Includes a 60-second buffer to be safe.
   */
  private isAdminTokenValid(): boolean {
    if (!this.adminAccessToken || !this.tokenExpiresAt) {
      return false; // No token exists
    }

    // Give a 60-second buffer to account for network latency etc.
    const safetyBuffer = 60 * 1000;
    const now = Date.now();

    // Return true if the token's expiration time is still in the future
    return this.tokenExpiresAt > now + safetyBuffer;
  }

  /**
   * Deletes a user from Keycloak using a valid admin token.
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      console.log(`Attempting to delete user ${userId} from Keycloak...`);

      // The request will be intercepted and the token will be validated/refreshed automatically
      await this.axiosInstance.delete(`/users/${userId}`);
      console.log(`✅ Successfully deleted user ${userId} from Keycloak.`);
    } catch (error) {
      console.error(
        `❌ Failed to delete user ${userId} from Keycloak`,
        axios.isAxiosError(error) ? error.response?.data : error.message,
      );
      throw new InternalServerErrorException(
        `Failed to delete user from Keycloak: ${error.message}`,
      );
    }
  }
}
