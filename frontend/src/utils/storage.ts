import { saveWorkDayToServer } from "@/services/api";
import { CreateWorkDay, Workday, WorkPracticeSettings } from "@/types";

const STORAGE_KEY = "work-practice-data";
const SETTINGS_KEY = "work-practice-settings";

export const getWorkDays = (): Workday[] => {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading work days:", error);
    return [];
  }
};

export const saveWorkday = (workday: Workday): void => {
  if (typeof window === "undefined") return;

  try {
    // attempt to save the work day in db
    saveWorkDayToServer(workday)
      .then(() => {
        console.log("Work day saved successfully:", workday);
      })
      .catch((error) => {
        console.error("Error saving work day to server:", error);
      });
  } catch (error) {
    console.error("Error saving work day:", error);
  }
};

export const deleteWorkday = (date: string): void => {
  if (typeof window === "undefined") return;

  try {
    const workdays = getWorkdays().filter((day) => day.date !== date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workdays));
  } catch (error) {
    console.error("Error deleting workday:", error);
  }
};

export const getWorkPracticeSettings = (): WorkPracticeSettings => {
  if (typeof window === "undefined") return { workDays: [1, 2, 3, 4, 5] };

  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { workDays: [1, 2, 3, 4, 5] }; // Default: Mon-Fri
  } catch (error) {
    console.error("Error reading settings:", error);
    return { workDays: [1, 2, 3, 4, 5] };
  }
};

export const saveWorkPracticeSettings = (
  settings: WorkPracticeSettings
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};
