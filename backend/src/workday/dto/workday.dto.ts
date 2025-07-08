import { MealLocation } from '@prisma/client';
import { IsDate, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateWorkdayDto {
  @IsString()
  @IsDate()
  // Ensure the date is a valid ISO date string
  date: string; // ISO date string

  @IsString()
  @MaxLength(300)
  activities: string;

  @IsString()
  @MaxLength(300)
  learnings: string;

  @IsString()
  mealLocation: MealLocation; // Enum type for meal location

  @IsString()
  @MaxLength(100)
  mealLocationOther?: string; // Optional, only if mealLocation is "other"

  @IsNumber()
  hours: number;
}
