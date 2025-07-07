"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Workday } from "@/types";

// ============================================================================
// Constants
// ============================================================================

/** Finnish names for the months of the year. */
const MONTH_NAMES = [
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

/** Finnish abbreviations for the days of the week, starting with Monday. */
const WEEKDAY_NAMES = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

// ============================================================================
// Component
// ============================================================================

interface CalendarProps {
  /** An array of all workdays submitted by the user. */
  userWorkdays: Workday[];
  /** An array of numbers representing the scheduled workdays of the week (e.g., [1, 2, 3] for Mon, Tue, Wed). */
  workDays: number[];
  /** A callback function triggered when a user clicks on a date cell. */
  onDateSelect: (date: string) => void;
  /** The currently selected date string (YYYY-MM-DD), used for highlighting. */
  selectedDate?: string;
}

/**
 * Renders an interactive monthly calendar grid.
 * It displays submitted workdays, highlights the current day, and allows users
 * to navigate between months and select dates to add or view entries.
 */
export const Calendar: React.FC<CalendarProps> = ({ userWorkdays, workDays, onDateSelect, selectedDate }) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** The currently displayed month and year. */
  const [currentDate, setCurrentDate] = useState(new Date());

  /** The date string (YYYY-MM-DD) that the user is currently hovering over. */
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Memoized Calculations
  // --------------------------------------------------------------------------

  /**
   * A Set of date strings for all submitted workdays.
   * Using a Set provides fast O(1) lookups to check if a day has an entry.
   * `useMemo` ensures this Set is only recreated when the `userWorkdays` prop changes.
   */
  const workDayDatesSet = useMemo(
    () =>
      new Set(
        userWorkdays.map((day) => (typeof day.date === "string" ? day.date : day.date.toISOString()).split("T")[0])
      ),
    [userWorkdays]
  );

  /**
   * An array of JSX elements representing the days of the month.
   * This is the most computationally expensive part of the component.
   * `useMemo` prevents the entire grid from being recalculated on every render,
   * only re-rendering when a relevant piece of state or props changes.
   */
  const calendarDays = useMemo(() => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

    // Render empty cells for padding at the start of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Render each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(Date.UTC(year, month, day));
      const dateStr = dayDate.toISOString().split("T")[0];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

      const hasWorkDayEntry = workDayDatesSet.has(dateStr);
      const isScheduledWorkday = workDays.includes(dayDate.getUTCDay());
      const isSelectable = isScheduledWorkday || isToday;

      const dayClasses = `
        relative p-2 w-full h-12 rounded-lg text-sm font-medium transition-all duration-150 group
        ${isToday ? "border-2 border-white/50" : ""}
        ${!isSelectable ? "glass-card text-secondary opacity-30 pointer-events-none" : ""}
        ${
          isSelectable && hasWorkDayEntry ? "bg-gradient-to-r from-success-400 to-success-500 text-white shadow-md" : ""
        }
        ${
          isSelectable && !hasWorkDayEntry
            ? "glass-card text-secondary glass-card-hover hover:scale-105 hover:shadow-md"
            : ""
        }
      `;

      days.push(
        <button
          key={dateStr}
          onClick={() => onDateSelect(dateStr)}
          onMouseEnter={() => setHoveredDate(dateStr)}
          onMouseLeave={() => setHoveredDate(null)}
          disabled={!isSelectable}
          className={dayClasses.trim()}
        >
          {day}
          {!hasWorkDayEntry && hoveredDate === dateStr && isSelectable && (
            <Plus className="absolute bottom-1 right-1 w-3 h-3 text-white/60" />
          )}
        </button>
      );
    }
    return days;
    // This dependency array is now complete, ensuring the calendar re-renders correctly.
  }, [currentDate, workDays, workDayDatesSet, selectedDate, hoveredDate, onDateSelect]);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  /**
   * Navigates to the previous or next month.
   * `useCallback` is used as a good practice, though not strictly necessary here.
   * @param {'prev' | 'next'} direction - The direction to navigate.
   */
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  }, []);

  /**
   * formats a day number into a date string (YYYY-MM-DD).
   * This is used for the `onDateSelect` callback to ensure the date format is consistent.
   * @param {number} day - The day of the month.
   */
  const formatDate = (day: number): string => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${year}-${month}-${dayStr}`;
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Header: Month/Year and Navigation Buttons */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-xl glass-card glass-card-hover text-primary"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-xl glass-card glass-card-hover text-primary"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {WEEKDAY_NAMES.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">{calendarDays}</div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-success-400 to-success-500 rounded-full"></div>
          <span className="text-secondary">Työpäivä</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 border-2 border-white/50 rounded-full"></div>
          <span className="text-secondary">Tänään</span>
        </div>
      </div>
    </div>
  );
};
