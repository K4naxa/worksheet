import { MealLocation } from '@prisma/client';
import { IsDate, IsString, IsNumber } from 'class-validator';

export class CreateWorkdayDto {
  @IsString()
  @IsDate()
  // Ensure the date is a valid ISO date string
  date: string; // ISO date string

  @IsString()
  activities: string;

  @IsString()
  learnings: string;

  @IsString()
  mealLocation: MealLocation; // Enum type for meal location

  @IsString()
  mealLocationOther?: string; // Optional, only if mealLocation is "other"

  @IsNumber()
  hours: number;
}
