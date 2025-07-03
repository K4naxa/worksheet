import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from 'src/app.service';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WorkdayModule } from './workday/workday.module';

import { AuthModule } from './auth/auth.module';
import { AuthController } from 'src/auth/auth.controller';

import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
} from 'nest-keycloak-connect';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    WorkdayModule,
    ConfigModule.forRoot({ isGlobal: true }),
    KeycloakConnectModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        // Keycloak configuration
        authServerUrl: configService.get<string>('KEYCLOAK_AUTH_URL') || '',
        realm: configService.get<string>('KEYCLOAK_REALM') || '',
        clientId:
          configService.get<string>('KEYCLOAK_CLIENT_ID') || ('' as string),
        secret: configService.get<string>('KEYCLOAK_CLIENT_SECRET') || '',

        bearerOnly: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    // Keycloak guards to protect routes
    {
      provide: APP_GUARD,
      useClass: ResourceGuard, // This will check for resource permissions
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard, // This will check for roles
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // This will check for authentication
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // This will apply the ThrottlerGuard globally, limiting requests
    },
  ],
})
export class AppModule {}
