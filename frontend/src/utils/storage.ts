import { WorkDay, WorkPracticeSettings } from '@/types';

const STORAGE_KEY = 'work-practice-data';
const SETTINGS_KEY = 'work-practice-settings';

export const getWorkDays = (): WorkDay[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading work days:', error);
    return [];
  }
};

export const saveWorkDay = (workDay: WorkDay): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const workDays = getWorkDays();
    const existingIndex = workDays.findIndex(day => day.date === workDay.date);
    
    if (existingIndex >= 0) {
      workDays[existingIndex] = { ...workDay, updatedAt: new Date().toISOString() };
    } else {
      workDays.push(workDay);
    }
    
    workDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workDays));
  } catch (error) {
    console.error('Error saving work day:', error);
  }
};

export const deleteWorkDay = (date: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const workDays = getWorkDays().filter(day => day.date !== date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workDays));
  } catch (error) {
    console.error('Error deleting work day:', error);
  }
};

export const getWorkPracticeSettings = (): WorkPracticeSettings => {
  if (typeof window === 'undefined') return { workDays: [1, 2, 3, 4, 5] };
  
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : { workDays: [1, 2, 3, 4, 5] }; // Default: Mon-Fri
  } catch (error) {
    console.error('Error reading settings:', error);
    return { workDays: [1, 2, 3, 4, 5] };
  }
};

export const saveWorkPracticeSettings = (settings: WorkPracticeSettings): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};