"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  MapPin,
  BookOpen,
  Briefcase,
  Clock,
  Edit,
  AlertCircle,
} from "lucide-react";

import { CreateWorkDay, Workday } from "@/types";

interface WorkDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSave now returns a Promise, allowing us to await its completion.
  onSave: (workDayDto: CreateWorkDay) => Promise<void>;
  selectedDate: string;
  existingWorkDay?: Workday;
}

// Correct meal location options to match Prisma Enum
const MEAL_LOCATION_OPTIONS: {
  value: "school" | "work" | "other";
  label: string;
  icon: string;
}[] = [
  { value: "school", label: "Koulu", icon: "🏫" },
  { value: "work", label: "Työpaikka", icon: "🏢" },
  { value: "other", label: "Muu", icon: "🍽️" },
];

export const WorkDayModal: React.FC<WorkDayModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  existingWorkDay,
}) => {
  // State for form fields
  const [activities, setActivities] = useState("");
  const [learnings, setLearnings] = useState("");
  const [hours, setHours] = useState<number>(8); // Renamed from hoursWorked
  const [mealLocation, setMealLocation] = useState<"school" | "work" | "other">(
    "work"
  );
  const [mealLocationOther, setMealLocationOther] = useState("");

  // State for modal behavior
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to populate form when modal opens or existingWorkDay changes
  useEffect(() => {
    if (isOpen) {
      // Reset states on open
      setError(null);
      setIsLoading(false);

      if (existingWorkDay) {
        // Populate form with existing data and enter read-only mode
        setActivities(existingWorkDay.activities);
        setLearnings(existingWorkDay.learnings);
        setHours(existingWorkDay.hours);
        setMealLocation(existingWorkDay.mealLocation);
        setMealLocationOther(existingWorkDay.mealLocationOther || "");
        setIsEditing(false); // Start in view mode
      } else {
        // Reset form for a new entry and enter edit mode immediately
        setActivities("");
        setLearnings("");
        setHours(8);
        setMealLocation("work");
        setMealLocationOther("");
        setIsEditing(true); // New entry is always in edit mode
      }
    }
  }, [existingWorkDay, isOpen]);

  const handleSave = async () => {
    // Basic client-side validation
    if (!activities.trim() || !learnings.trim() || hours <= 0) {
      setError("Täytä kaikki pakolliset kentät.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Construct the DTO for the API call
    const workDayDto: CreateWorkDay = {
      date: selectedDate,
      activities: activities.trim(),
      learnings: learnings.trim(),
      hours,
      mealLocation,
      // Only include mealLocationOther if mealLocation is 'other'
      ...(mealLocation === "other" && {
        mealLocationOther: mealLocationOther.trim(),
      }),
    };

    try {
      await onSave(workDayDto);
      onClose(); // Close the modal only on success
    } catch (err) {
      // Display error message from the API call
      setError(
        err instanceof Error ? err.message : "Tuntematon virhe tallennuksessa."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fi-FI", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isFormDisabled = !isEditing || isLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {existingWorkDay ? "Työpäivän tiedot" : "Lisää uusi työpäivä"}
            </h2>
            <p className="text-muted text-sm">{formatDate(selectedDate)}</p>
          </div>
          {/* Show Edit button only if viewing an existing day and not already editing */}
          {existingWorkDay && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Muokkaa</span>
            </button>
          )}
          {/* Close button is always visible */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-card glass-card-hover text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Activities Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">
                Mitä teit tänään?
              </label>
            </div>
            <textarea
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="Kuvaile päivän pääasialliset aktiviteetit ja tehtävät..."
              className="input-field resize-none h-24"
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* Learnings Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Mitä opit?</label>
            </div>
            <textarea
              value={learnings}
              onChange={(e) => setLearnings(e.target.value)}
              placeholder="Mitä uusia taitoja, tietoja tai oivalluksia sait?"
              className="input-field resize-none h-24"
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* Hours Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Työtunnit</label>
            </div>
            <input
              type="number"
              value={hours}
              onChange={(e) =>
                setHours(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min="0"
              max="24"
              step="0.5"
              className="input-field"
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* Meal Location Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Missä söit?</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MEAL_LOCATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMealLocation(option.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    mealLocation === option.value
                      ? "border-primary-500 bg-primary-500/20 text-primary"
                      : "border-white/20 glass-card text-secondary glass-card-hover"
                  }`}
                  disabled={isFormDisabled}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>

            {mealLocation === "other" && (
              <input
                type="text"
                value={mealLocationOther}
                onChange={(e) => setMealLocationOther(e.target.value)}
                placeholder="Määritä missä..."
                className="input-field"
                disabled={isFormDisabled}
              />
            )}
          </div>
        </div>

        {/* Footer with Error Display and Action Buttons */}
        <div className="p-6 border-t border-white/20 flex-shrink-0">
          {error && (
            <div className="mb-4 flex items-center p-3 rounded-lg bg-red-500/20 text-red-400">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span>{error}</span>
            </div>
          )}
          {/* Only show action buttons if in editing mode */}
          {isEditing && (
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
                disabled={isLoading}
              >
                Peruuta
              </button>
              <button
                onClick={handleSave}
                disabled={
                  !activities.trim() ||
                  !learnings.trim() ||
                  hours <= 0 ||
                  isLoading
                }
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Tallennetaan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Tallenna</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
