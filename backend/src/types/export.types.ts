export interface ExportUser {
  id: string;
  email: string;
  name: string;
  registrationCompleted: boolean;
  workdays?: ExportWorkday[] | null;
  company: string | null;
  instructor: string | null;

  start_date: Date | null;
  end_date: Date | null;
}

export interface ExportWorkday {
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
