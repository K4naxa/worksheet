export interface CreateWorkDay {
  date: string; // ISO date string
  activities: string;
  learnings: string;
  hours: number;
  mealLocation: "school" | "workplace" | "other";
  mealLocationOther?: string; // Optional, only if mealLocation is "other"
}

export interface WorkPracticeSettings {
  startDate?: string;
  endDate?: string;
  workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface WorkStats {
  totalDays: number;
  totalHours: number;
  practiceProgress: number; // percentage 0-100
  mealDistribution: {
    school: number;
    workplace: number;
    other: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  registrationCompleted: boolean;
  userWorkdays?: Workday[] | null;
  workdays?: number[] | null; // Array of integers representing workdays (0 = Sunday, 1 = Monday, etc.)
  company: string | null;
  instructor: string | null;

  start_date: Date | null;
  end_date: Date | null;
}

export interface Workday {
  id: string;
  date: Date;
  activities: string;
  learnings: string;
  mealLocation: string; // Enum type for meal location
  mealLocationOther: string | null; // Optional, only if mealLocation is "other"
  hours: number;

  createdAt: Date;
  updatedAt: Date | null;
}

// Registration
export interface RegistrationComplition {
  company: string;
  instructor: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  workdays: number[]; // Array of integers representing workdays (0 = Sunday, 1 = Monday, etc.)
}
