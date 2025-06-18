"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { WorkDay } from "@/types";

interface CalendarProps {
  workDays: WorkDay[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  workDays,
  onDateSelect,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const monthNames = [
    "Tammikuu",
    "Helmikuu",
    "Maaliskuu",
    "Huhtikuu",
    "Toukokuu",
    "Kesäkuu",
    "Heinäkuu",
    "Elokuu",
    "Syyskuu",
    "Lokakuu",
    "Marraskuu",
    "Joulukuu",
  ];

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const workDayDates = new Set(workDays.map((day) => day.date));

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const formatDate = (day: number): string => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(day);
      const hasWorkDay = workDayDates.has(dateStr);
      const isSelected = selectedDate === dateStr;
      const today = isToday(day);
      const isHovered = hoveredDate === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => onDateSelect(dateStr)}
          onMouseEnter={() => setHoveredDate(dateStr)}
          onMouseLeave={() => setHoveredDate(null)}
          className={`
            relative p-2 w-full h-12 rounded-lg text-sm font-medium transition-all duration-150
            hover:scale-105 hover:shadow-md group
            ${
              hasWorkDay
                ? "bg-gradient-to-r from-success-400 to-success-500 text-white shadow-md"
                : today
                ? "glass-card text-primary border-2 border-white/30"
                : "glass-card text-secondary glass-card-hover"
            }
          `}
        >
          {day}
          {!hasWorkDay && isHovered && (
            <Plus className="absolute bottom-1 right-1 w-3 h-3 text-white/60" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-xl glass-card glass-card-hover text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-xl glass-card glass-card-hover text-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-success-400 to-success-500 rounded-full"></div>
          <span className="text-secondary">Työpäivä</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 border-2 border-white/30 rounded-full"></div>
          <span className="text-secondary">Tänään</span>
        </div>
      </div>
    </div>
  );
};
