export interface WorkDay {
  id: string;
  date: string;
  activities: string;
  learnings: string;
  hours: number;
  mealLocation: "school" | "workplace" | "other";
  mealLocationOther?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface LoginData {
  email: string;
  password: string;
}
