import { saveWorkDayToServer, deleteWorkdayFromServer } from "@/services/api";
import { CreateWorkDay, Workday, WorkPracticeSettings } from "@/types";

export const saveWorkday = (workday: Workday): Promise<void> => {
  return saveWorkDayToServer(workday)
    .then(() => {
      console.log("✅✅Work day saved successfully to server.");
    })
    .catch((error) => {
      console.error("❌ Error saving work day to server:", error);
      throw error;
    });
};

export const deleteWorkday = (date: string): Promise<void> => {
  return deleteWorkdayFromServer(date)
    .then(() => {
      console.log("✅✅Work day deleted successfully from server.");
    })
    .catch((error) => {
      console.error("❌ Error deleting work day from server:", error);
      throw error;
    });
};
