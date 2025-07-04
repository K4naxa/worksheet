import { Injectable, ConflictException } from '@nestjs/common';
import { Workday } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkdayDto } from 'src/workday/dto/workday.dto';

@Injectable()
export class WorkdayService {
  constructor(private prisma: PrismaService) {}

  async createWorkday(userId: string, workday: CreateWorkdayDto) {
    try {
      console.log('Saving workday for user:', userId, 'with data:', workday);
      // Check if a workday already exists for the user on the same date
      const existingWorkday = await this.prisma.workday.findFirst({
        where: {
          userId: userId,
          date: workday.date,
        },
      });

      if (existingWorkday) {
        throw new ConflictException('Workday already exists for this date');
      }

      // Create a new workday entry
      const newWorkday = await this.prisma.workday.create({
        data: {
          userId: userId,
          date: workday.date,
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
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
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
