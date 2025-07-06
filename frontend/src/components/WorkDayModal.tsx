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
  Trash,
  Trash2,
} from "lucide-react";

import { CreateWorkDay, Workday } from "@/types";
import { useModalEffects } from "../hooks/useModalEffect";

interface WorkDayModalProps {
  modalData: {
    isOpen: boolean;
    selectedDate: string;
    existingWorkday?: Workday;
  };
  onClose: () => void;
  // onSave now returns a Promise, allowing us to await its completion.
  onSave: (workDayDto: CreateWorkDay) => Promise<void>;
  onDeleteRequest?: (date: string) => void;
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
  modalData: { isOpen, selectedDate, existingWorkday },
  onClose,
  onSave,
  onDeleteRequest,
}) => {
  // State for form fields

  const [ModalFormData, setModalFormData] = useState<Workday>({
    id: "",
    date: selectedDate,
    activities: "",
    learnings: "",
    hours: 8,
    mealLocation: "work",
    mealLocationOther: "",
  });
  // State for modal behavior
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to populate form when modal opens or existingWorkDay changes
  useEffect(() => {
    // This effect synchronizes the modal's internal state with its props.
    // It's the "source of truth" for what the form should display.

    console.log("Syncing form state for date:", selectedDate);

    setError(null);
    setIsLoading(false);

    if (existingWorkday) {
      // We have an existing workday, so populate the form and set to view mode.
      setModalFormData(existingWorkday);
      setIsEditing(false);
    } else {
      // This is a new entry, so reset the form to its default state and set to edit mode.
      setModalFormData({
        id: "",
        date: selectedDate,
        activities: "",
        learnings: "",
        hours: 8,
        mealLocation: "work",
        mealLocationOther: "",
      });
      setIsEditing(true);
    }
  }, [existingWorkday, selectedDate]);

  useModalEffects(isOpen, onClose);

  const handleSave = async () => {
    // Basic client-side validation
    if (
      !ModalFormData.activities.trim() ||
      !ModalFormData.learnings.trim() ||
      ModalFormData.hours <= 0
    ) {
      setError("Täytä kaikki pakolliset kentät.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Construct the DTO for the API call
    const workDayDto: CreateWorkDay = {
      date: selectedDate,
      activities: ModalFormData.activities.trim(),
      learnings: ModalFormData.learnings.trim(),
      hours: ModalFormData.hours,
      mealLocation: ModalFormData.mealLocation,
      // Only include mealLocationOther if mealLocation is 'other'
      ...(ModalFormData.mealLocation === "other" && {
        mealLocationOther: ModalFormData.mealLocationOther.trim(),
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card  rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/20 flex-shrink-0">
          {/* Left side: Title and Date */}
          <div>
            <h2 className="text-xl font-bold text-primary">
              {existingWorkday ? "Työpäivän tiedot" : "Lisää uusi työpäivä"}
            </h2>
            <p className="text-sm text-muted">{formatDate(selectedDate)}</p>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit Button: Shown when viewing an existing entry and not in edit mode */}
            {existingWorkday && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center space-x-2"
                aria-label="Muokkaa työpäivää"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Muokkaa</span>
              </button>
            )}

            {/* Close Button: Always visible */}
            <button
              onClick={onClose}
              className="btn-secondary space-x-1"
              aria-label="Sulje modaali"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Activities Section */}
          <div className="space-y-3 relative pb-3 -mb-3">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">
                Mitä teit tänään?
              </label>
            </div>
            {isEditing ? (
              <textarea
                value={ModalFormData.activities}
                onChange={(e) =>
                  setModalFormData({
                    ...ModalFormData,
                    activities: e.target.value,
                  })
                }
                placeholder="Kuvaile päivän pääasialliset aktiviteetit ja tehtävät..."
                className="input-field resize-none h-24"
                maxLength={300}
                required
              />
            ) : (
              <div className="p-3 w-full rounded-lg bg-white/5 text-secondary min-h-[6rem] whitespace-pre-wrap prose prose-invert prose-sm max-w-none break-words">
                {ModalFormData.activities || (
                  <span className="text-muted-foreground">
                    Ei aktiviteetteja.
                  </span>
                )}
              </div>
            )}
            {isEditing && (
              <div
                className="text-right text-xs text-muted absolute right-1 bottom-0"
                style={
                  ModalFormData.activities.length == 300 ? { color: "red" } : {}
                }
              >
                {ModalFormData.activities.length} / 300
              </div>
            )}
          </div>

          {/* Learnings Section */}
          <div className="space-y-3 relative pb-3 -mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Mitä opit?</label>
            </div>
            {isEditing ? (
              <textarea
                value={ModalFormData.learnings}
                onChange={(e) =>
                  setModalFormData({
                    ...ModalFormData,
                    learnings: e.target.value,
                  })
                }
                placeholder="Mitä uusia taitoja, tietoja tai oivalluksia sait?"
                className="input-field resize-none h-24"
                maxLength={300}
                required
                disabled={isLoading}
              />
            ) : (
              <div className="p-3 w-full rounded-lg bg-white/5 text-secondary min-h-[6rem] whitespace-pre-wrap prose prose-invert prose-sm max-w-none break-words">
                {ModalFormData.activities || (
                  <span className="text-muted-foreground">
                    Ei aktiviteetteja.
                  </span>
                )}
              </div>
            )}
            {isEditing && (
              <div
                className="text-right text-xs text-muted absolute right-1 bottom-0"
                style={
                  ModalFormData.learnings.length == 300 ? { color: "red" } : {}
                }
              >
                {ModalFormData.learnings.length} / 300
              </div>
            )}
          </div>

          {/* Hours Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Työtunnit</label>
            </div>
            {isEditing ? (
              <input
                type="number"
                value={ModalFormData.hours}
                onChange={(e) =>
                  setModalFormData({
                    ...ModalFormData,
                    hours: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                min="0"
                max="24"
                step="0.5"
                className="input-field"
                required
                disabled={isFormDisabled}
              />
            ) : (
              <div className="p-3 rounded-lg bg-white/5 text-secondary">
                {ModalFormData.hours > 0
                  ? `${ModalFormData.hours} tuntia`
                  : "Ei työtunteja."}
              </div>
            )}
          </div>

          {/* Meal Location Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Missä söit?</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MEAL_LOCATION_OPTIONS.map((option) =>
                isEditing ? (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setModalFormData({
                        ...ModalFormData,
                        mealLocation: option.value,
                      })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${
                      ModalFormData.mealLocation === option.value
                        ? "border-primary-500 bg-primary-500/20 text-primary"
                        : "border-white/20 glass-card text-secondary glass-card-hover"
                    } `}
                    disabled={isFormDisabled}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ) : (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setModalFormData({
                        ...ModalFormData,
                        mealLocation: option.value,
                      })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${
                      ModalFormData.mealLocation === option.value
                        ? "border-primary-500 bg-primary-500/20 text-primary"
                        : " border-transparent bg-white/5 text-secondary"
                    } `}
                    disabled={isFormDisabled}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                )
              )}
            </div>

            {ModalFormData.mealLocation === "other" &&
              (isEditing ? (
                <input
                  type="text"
                  value={ModalFormData.mealLocationOther}
                  onChange={(e) =>
                    setModalFormData({
                      ...ModalFormData,
                      mealLocationOther: e.target.value,
                    })
                  }
                  placeholder="Määritä missä..."
                  className="input-field"
                  disabled={isFormDisabled}
                />
              ) : (
                <div className="p-3 rounded-lg bg-white/5 text-secondary">
                  {ModalFormData.mealLocationOther || "Ei määritelty."}
                </div>
              ))}
          </div>

          {(isEditing || error) && (
            <div className="p-6 border-t border-white/20 flex-shrink-0">
              {error && (
                <div className="mb-4 flex items-center p-3 rounded-lg bg-red-500/20 text-red-400">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  <span>{error}</span>
                </div>
              )}
              {/* Only show action buttons if in editing mode */}
              {isEditing && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {existingWorkday && onDeleteRequest && (
                    <button
                      onClick={() => onDeleteRequest(selectedDate)}
                      className="btn-danger rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors p-2.5"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex  gap-4 flex-wrap ml-auto">
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
                        !ModalFormData.activities.trim() ||
                        !ModalFormData.learnings.trim() ||
                        ModalFormData.hours <= 0 ||
                        isLoading
                      }
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center "
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
