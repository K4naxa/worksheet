import { WorkDay, WorkStats, WorkPracticeSettings } from '@/types';

export const calculateStats = (workDays: WorkDay[], settings: WorkPracticeSettings): WorkStats => {
  const totalDays = workDays.length;
  const totalHours = workDays.reduce((sum, day) => sum + day.hoursWorked, 0);
  
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
  
  // Meal distribution
  const mealDistribution = workDays.reduce(
    (acc, day) => {
      acc[day.mealLocation]++;
      return acc;
    },
    { school: 0, workplace: 0, other: 0 }
  );
  
  return {
    totalDays,
    totalHours,
    practiceProgress,
    mealDistribution
  };
};