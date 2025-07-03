// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakProfile } from 'src/types/keycloack.types';
import { ExportUser, ExportWorkday } from 'src/types/export.types';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(keycloackUser: KeycloakProfile): Promise<ExportUser> {
    const { sub, email, name } = keycloackUser;

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { id: sub },
    });

    if (!user) {
      // If user doesn't exist, create a new one
      user = await this.prisma.user.create({
        data: {
          id: sub,
          email: email,
          name: name,
          registrationCompleted: false,
        },
      });
    } else if (user.email !== email) {
      // Update user information if email has changed
      user = await this.prisma.user.update({
        where: { id: sub },
        data: {
          email: email,
          name: name,
        },
      });
    }

    // If registration is not completed, return early with minimal user data
    // This avoids unnecessary database queries for workdays
    // and allows the client to redirect the user to complete their profile
    if (!user.registrationCompleted) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        registrationCompleted: user.registrationCompleted as boolean,
        company: null,
        instructor: null,
        start_date: null,
        end_date: null,

        workdays: null,
      };
    }

    // If registration is completed, fetch the user's workdays
    // This is only done if the user has completed their profile
    const workdays: ExportWorkday[] = await this.prisma.workday.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        date: true,
        activities: true,
        learnings: true,
        mealLocation: true,
        mealLocationOther: true,
        hours: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return the user data in the desired format
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      registrationCompleted: user.registrationCompleted as boolean,
      company: user.company,
      instructor: user.instructor,
      start_date: user.start_date,
      end_date: user.end_date,

      workdays: workdays,
    };
  }

  async getProfile(keycloakUser: KeycloakProfile): Promise<ExportUser> {
    const user = await this.findOrCreateUser(keycloakUser);

    return user;
  }

  async getRegistrationStatus(
    keycloakUser: KeycloakProfile,
  ): Promise<{ registrationCompleted: boolean }> {
    const user = await this.findOrCreateUser(keycloakUser);
    return { registrationCompleted: user.registrationCompleted };
  }
}
