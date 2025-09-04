import { Workday, WorkStats, WorkPracticeSettings } from "@/types";

export const calculateStats = (workDays: Workday[], settings: WorkPracticeSettings): WorkStats => {
  // Filter out sick days for calculations
  const nonSickDays = workDays.filter((day) => !day.isSickday);

  const totalDays = nonSickDays.length;
  const totalHours = nonSickDays.reduce((sum, day) => sum + day.hours, 0);

  // Calculate practice progress
  let practiceProgress = 0;
  if (settings.startDate && settings.endDate) {
    const startDate = new Date(settings.startDate);
    const endDate = new Date(settings.endDate);
    const today = new Date();

    const totalPracticeDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    if (daysPassed > 0 && totalPracticeDays > 0) {
      practiceProgress = Math.min(100, Math.max(0, (daysPassed / totalPracticeDays) * 100));
    }
  }

  // Meal distribution (excluding sick days)
  const mealDistribution = nonSickDays.reduce(
    (acc, day) => {
      acc[day.mealLocation]++;
      return acc;
    },
    { school: 0, work: 0, other: 0 }
  );

  return {
    totalDays,
    totalHours,
    practiceProgress,
    mealDistribution,
  };
};
