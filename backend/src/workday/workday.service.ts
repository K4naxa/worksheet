import { Injectable } from '@nestjs/common';
import { Workday } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { KeycloakProfile } from 'src/types/keycloack.types';
import { CreateWorkdayDto } from 'src/workday/dto/workday.dto';

@Injectable()
export class WorkdayService {
  constructor(private prisma: PrismaService) {}

  async saveWorkDay(user: KeycloakProfile, workday: CreateWorkdayDto) {
    try {
      const workDate = new Date(workday.date);
      // Check if a workday already exists for the user on the same date
      const existingWorkday = await this.prisma.workday.findFirst({
        where: {
          userId: user.sub,
          date: workDate,
        },
      });

      // If a workday already exists, update it
      if (existingWorkday) {
        console.log(
          `Workday already exists for user ${user.email} on date ${workday.date}, Updating existing entry.`,
        );

        const updatedWorkday = await this.prisma.workday.update({
          where: { id: existingWorkday.id },
          data: {
            activities: workday.activities,
            learnings: workday.learnings,
            mealLocation: workday.mealLocation,
            mealLocationOther:
              workday.mealLocation === 'other'
                ? workday.mealLocationOther
                : null,
            hours: workday.hours,
          },
        });

        return updatedWorkday;
      }
      // If no existing workday, create a new one
      console.log(
        `No existing workday found for user ${user.email} on date ${workday.date}, Creating new entry.`,
      );

      // Create a new workday entry
      const newWorkday = await this.prisma.workday.create({
        data: {
          userId: user.sub,
          date: workDate,
          activities: workday.activities,
          learnings: workday.learnings,
          mealLocation: workday.mealLocation,
          mealLocationOther:
            workday.mealLocation === 'other' ? workday.mealLocationOther : null,
          hours: workday.hours,
        },
        select: {
          id: true,
          userId: true,
          date: true,
          activities: true,
          learnings: true,
          mealLocation: true,
          hours: true,
          createdAt: true,
        },
      });

      return newWorkday;
    } catch {
      throw new Error('Error saving workday');
    }
  }

  async getWorkDays(userId: string): Promise<Workday[]> {
    try {
      const workdays = await this.prisma.workday.findMany({
        where: { userId: userId },
        orderBy: { date: 'desc' },
      });
      return workdays;
    } catch {
      throw new Error('Error fetching workdays');
    }
  }
}
