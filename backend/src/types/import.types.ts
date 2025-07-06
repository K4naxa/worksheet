export interface Registration {
  company: string;
  instructor: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  workdays: number[]; // Array of integers representing workdays (0 = Sunday, 1 = Monday, etc.)
}
