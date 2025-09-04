// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakProfile } from 'src/types/keycloack.types';
import { User } from '@prisma/client';
import { KeycloakAdminService } from 'src/keycloak-admin/keycloak-admin.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private keycloakAdminService: KeycloakAdminService,
  ) {}

  async findOrCreateUser(keycloackUser: KeycloakProfile): Promise<User> {
    const { sub, email, name } = keycloackUser;

    // Add debugging
    console.log('Attempting to find or create user with:', {
      sub,
      email,
      name,
    });

    try {
      // Check if user already exists first
      const existingUser = await this.prisma.user.findUnique({
        where: { id: sub },
        include: {
          userWorkdays: true,
        },
      });

      if (existingUser) {
        console.log('User already exists, updating:', existingUser.id);
        // Update existing user
        const updatedUser = await this.prisma.user.update({
          where: { id: sub },
          data: {
            email: email,
            name: name,
          },
          include: {
            userWorkdays: true,
          },
        });
        return updatedUser;
      }

      console.log('User does not exist, creating new user');
      // Create new user
      const newUser = await this.prisma.user.create({
        data: {
          id: sub,
          email: email,
          name: name,
          registrationCompleted: false,
          company: null,
          instructor: null,
          start_date: null,
          end_date: null,
          workdays: [],
        },
        include: {
          userWorkdays: true,
        },
      });

      return newUser;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  async getProfile(keycloakUser: KeycloakProfile): Promise<User> {
    const user = await this.findOrCreateUser(keycloakUser);

    return user;
  }

  async getRegistrationStatus(
    keycloakUser: KeycloakProfile,
  ): Promise<{ registrationCompleted: boolean }> {
    const user = await this.findOrCreateUser(keycloakUser);
    return { registrationCompleted: user.registrationCompleted };
  }

  async registerUser(
    keycloakUser: KeycloakProfile,
    body: {
      company: string;
      instructor: string;
      startDate: string; // ISO date string
      endDate: string; // ISO date string
      workdays: number[]; // Array of integers representing workdays (0 = Sunday, 1 = Monday, etc.)
      defaultWorkdayLength: number; // Default workday length in hours
    },
  ) {
    // Update user with registration details
    const updatedUser = await this.prisma.user.update({
      where: { id: keycloakUser.sub },
      data: {
        company: body.company,
        instructor: body.instructor,
        start_date: new Date(body.startDate),
        end_date: new Date(body.endDate),
        registrationCompleted: true,
        workdays: body.workdays,
        defaultWorkdayLength: body.defaultWorkdayLength,
      },
    });

    // Return the updated user data
    return updatedUser;
  }

  // Delete user profile and all associated data
  // First delete the user profile from Keycloak, then delete the user from Prisma
  async deleteUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // Just to be sure, check if the user exists in Prisma
      throw new NotFoundException(
        `User with ID ${userId} not found in local database.`,
      );
    }

    // Delete the user from Keycloak
    await this.keycloakAdminService.deleteUser(userId);

    // Delete the user from Prisma
    await this.prisma.$transaction(async (prisma) => {
      // Delete associated workdays first
      await prisma.workday.deleteMany({
        where: { userId: userId },
      });

      // Now delete the user
      await prisma.user.delete({
        where: { id: userId },
      });
    });

    console.log(
      `✅ Successfully deleted user ${userId} and all related data from local database.`,
    );
  }
}
