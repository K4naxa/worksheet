import { IsArray, IsNumber, IsString, MaxLength } from 'class-validator';

export class RegistrationFormDto {
  @IsString()
  @MaxLength(100) // Limit to 100 characters
  company: string;

  @IsString()
  @MaxLength(100) // Limit to 100 characters
  instructor: string;

  @IsString()
  // Ensure the date is a valid ISO date string
  startDate: string; // ISO date string

  @IsString()
  // Ensure the date is a valid ISO date string
  endDate: string; // ISO date string
  @IsArray()
  workdays: number[];

  @IsNumber()
  defaultWorkdayLength: number; // Default workday length in hours
}
