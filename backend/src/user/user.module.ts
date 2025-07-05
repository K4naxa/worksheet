import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserController } from './user.controller';
import { KeycloakAdminService } from 'src/keycloak-admin/keycloak-admin.service';

@Module({
  imports: [PrismaModule],
  providers: [UserService, KeycloakAdminService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
