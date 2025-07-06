import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkdayDto } from 'src/workday/dto/workday.dto';

@Injectable()
export class WorkdayService {
  constructor(private prisma: PrismaService) {}

  async saveWorkday(userId: string, workday: CreateWorkdayDto) {
    try {
      console.log('Saving workday for user:', userId, 'with data:', workday);
      // Check if a workday already exists for the user on the same date

      const formattedDate = new Date(workday.date);
      const existingWorkday = await this.prisma.workday.findFirst({
        where: {
          userId: userId,
          date: formattedDate,
        },
      });

      if (existingWorkday) {
        throw new ConflictException('Workday already exists for this date');
      }

      // Create a new workday entry
      const newWorkday = await this.prisma.workday.create({
        data: {
          userId: userId,
          date: formattedDate,
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

  async deleteWorkday(userId: string, date: string) {
    try {
      await this.prisma.workday.deleteMany({
        where: {
          userId: userId,
          date: new Date(date), // Ensure date is in correct format
        },
      });
    } catch (error) {
      console.error('Error deleting workday:', error);
      throw new Error('Error deleting workday');
    }
  }

  async getWorkdays(userId: string) {
    try {
      const workdays = await this.prisma.workday.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          date: 'desc',
        },
      });

      return workdays;
    } catch (error) {
      console.error('Error fetching workdays:', error);
      throw new Error('Error fetching workdays');
    }
  }
}
