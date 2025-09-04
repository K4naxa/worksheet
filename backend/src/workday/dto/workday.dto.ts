import { MealLocation } from '@prisma/client';
import {
  IsDate,
  IsString,
  IsNumber,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class CreateWorkdayDto {
  @IsString()
  @IsDate()
  // Ensure the date is a valid ISO date string
  date: string; // ISO date string

  @IsString()
  @MaxLength(300)
  activities: string;

  @IsBoolean()
  isSickday: boolean;

  @IsString()
  @MaxLength(300)
  learnings: string;

  @IsString()
  mealLocation: MealLocation; // Enum type for meal location

  @IsNumber()
  hours: number;
}
