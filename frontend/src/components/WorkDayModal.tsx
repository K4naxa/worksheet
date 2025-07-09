"use client";

import React, { useState, useEffect } from "react";
import { X, Save, MapPin, BookOpen, Briefcase, Clock, Edit, AlertCircle, Trash2 } from "lucide-react";
import { CreateWorkDay, Workday } from "@/types";
import { useModalEffects } from "@/hooks/useModalEffect";

// ============================================================================
// Constants
// ============================================================================

/**
 * Defines the available meal location options for the form.
 * This is kept outside the component as it's static data.
 */
const MEAL_LOCATION_OPTIONS: {
  value: "school" | "work" | "other";
  label: string;
  icon: string;
}[] = [
  { value: "school", label: "Koulu", icon: "🏫" },
  { value: "work", label: "Työpaikka", icon: "🏢" },
  { value: "other", label: "Muu", icon: "🍽️" },
];

/**
 * The initial, empty state for a new workday entry.
 * Used to reset the form.
 */
const INITIAL_FORM_STATE: CreateWorkDay = {
  date: "",
  activities: "",
  learnings: "",
  hours: 8,
  mealLocation: "work",
  mealLocationOther: "",
};

// ============================================================================
// Component
// ============================================================================

interface WorkDayModalProps {
  modalData: {
    isOpen: boolean;
    selectedDate: string;
    existingWorkday?: Workday;
    isEditing?: boolean; // Optional flag to indicate if the modal is in edit mode
  };
  onClose: () => void;
  onSave: (workDayDto: CreateWorkDay) => Promise<void>;
  onDeleteRequest?: (date: string) => void;
}

/**
 * A modal component for creating, viewing, and editing a single workday entry.
 * It operates in two modes: 'view' for existing entries and 'edit' for creating or modifying entries.
 */
export const WorkDayModal: React.FC<WorkDayModalProps> = ({
  modalData: { isOpen, selectedDate, existingWorkday, isEditing: initialIsEditing },
  onClose,
  onSave,
  onDeleteRequest,
}) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** The main state for all form fields. It holds either a full `Workday` or a `CreateWorkDay` object. */
  const [formData, setFormData] = useState<Workday | CreateWorkDay>(existingWorkday || { ...INITIAL_FORM_STATE });

  /** Controls whether the form fields are editable or in a read-only view. */
  const [isEditing, setIsEditing] = useState(initialIsEditing || !existingWorkday);

  /** Manages the loading state during async operations like saving. */
  const [isLoading, setIsLoading] = useState(false);

  /** Stores any validation or submission error messages to be displayed to the user. */
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Derived State
  // --------------------------------------------------------------------------

  /** A boolean flag to conveniently disable form elements during loading or when not in edit mode. */
  const isFormDisabled = !isEditing || isLoading;

  /** A boolean flag that determines if the 'Save' button should be enabled based on required fields. */
  const isSaveDisabled =
    !formData.activities.trim() ||
    !formData.learnings.trim() ||
    formData.hours <= 0 ||
    (formData.mealLocation === "other" && !formData.mealLocationOther?.trim()) ||
    isLoading;

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  /**
   * Synchronizes the modal's internal state when it's opened or when the selected data changes.
   * This effect acts as the single source of truth for initializing the form.
   */
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(false);

      if (existingWorkday) {
        setFormData(existingWorkday);
        setIsEditing(initialIsEditing ?? false); // Use the prop!
      } else {
        setFormData({ ...INITIAL_FORM_STATE, date: selectedDate });
        setIsEditing(true);
      }
    }
  }, [isOpen, existingWorkday, selectedDate, initialIsEditing]);

  useModalEffects(isOpen, onClose);

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  /**
   * Handles the form submission. It performs client-side validation,
   * constructs the data transfer object (DTO), and calls the `onSave` prop.
   */
  const handleSave = async () => {
    // Client-side validation is already handled by `isSaveDisabled`, but an extra check is good practice.
    if (isSaveDisabled) {
      setError("Täytä kaikki pakolliset kentät.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Construct the DTO to ensure only necessary fields are sent to the server.
    const workDayDto: CreateWorkDay = {
      date: selectedDate,
      activities: formData.activities.trim(),
      learnings: formData.learnings.trim(),
      hours: formData.hours,
      mealLocation: formData.mealLocation,
      ...(formData.mealLocation === "other" && { mealLocationOther: formData.mealLocationOther?.trim() }),
    };

    try {
      await onSave(workDayDto);
      // The `onClose` is intentionally omitted here; the parent component should close the modal on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tuntematon virhe tallennuksessa.");
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Helper Functions
  // --------------------------------------------------------------------------

  /**
   * Formats a date string into a localized, human-readable format.
   * @param {string} dateStr - The date string to format (YYYY-MM-DD).
   * @returns {string} The formatted date.
   */
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fi-FI", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card  rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-white/20 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {existingWorkday ? "Työpäivän tiedot" : "Lisää uusi työpäivä"}
            </h2>
            <p className="text-sm text-muted">{formatDate(selectedDate)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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
            <button onClick={onClose} className="btn-secondary p-2.5" aria-label="Sulje modaali">
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
              <label className="text-primary font-medium">Mitä teit tänään?</label>
            </div>
            {isEditing ? (
              <textarea
                value={formData.activities}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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
                {formData.activities || <span className="text-muted-foreground">Ei aktiviteetteja.</span>}
              </div>
            )}
            {isEditing && (
              <div
                className="text-right text-xs text-muted absolute right-1 bottom-0"
                style={formData.activities.length == 300 ? { color: "red" } : {}}
              >
                {formData.activities.length} / 300
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
                value={formData.learnings}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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
                {formData.learnings || <span className="text-muted-foreground">Ei aktiviteetteja.</span>}
              </div>
            )}
            {isEditing && (
              <div
                className="text-right text-xs text-muted absolute right-1 bottom-0"
                style={formData.learnings.length == 300 ? { color: "red" } : {}}
              >
                {formData.learnings.length} / 300
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
              <div className="flex items-center gap-4 select-none ">
                <div
                  className="w-full"
                  onMouseDown={(e) => {
                    // Prevent accidental drag/select when clicking anywhere in the container except the thumb
                    if (e.target === e.currentTarget) {
                      e.preventDefault();
                    }
                  }}
                  onDragStart={(e) => e.preventDefault()}
                >
                  <input
                    type="range"
                    min="0.25"
                    max="10"
                    step="0.25"
                    value={formData.hours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hours: parseFloat(e.target.value),
                      })
                    }
                    className=" range-themed"
                    disabled={isFormDisabled}
                  />
                  <div className="flex justify-between text-xs text-muted pt-1">
                    <span>15min</span>
                    <span className="-ml-5">5h</span>
                    <span>10h</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-md px-3 py-1.5 w-28 flex flex-col justify-start text-start text-primary select-text">
                  <span>{`${Math.floor(formData.hours)} tuntia`}</span>
                  <span>{` ${Math.round((formData.hours % 1) * 60)} min`}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-white/5 text-secondary">
                {formData.hours > 0 ? (
                  <>
                    {" "}
                    <span>{`${Math.floor(formData.hours)} tuntia`}</span>
                    {(formData.hours % 1) * 60 !== 0 && (
                      <span>{` ${Math.round((formData.hours % 1) * 60)} minuuttia`}</span>
                    )}
                  </>
                ) : (
                  "Ei työtunteja."
                )}
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
                      setFormData({
                        ...formData,
                        mealLocation: option.value,
                      })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.mealLocation === option.value
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
                      setFormData({
                        ...formData,
                        mealLocation: option.value,
                      })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.mealLocation === option.value
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

            {formData.mealLocation === "other" &&
              (isEditing ? (
                <input
                  type="text"
                  maxLength={100}
                  value={formData.mealLocationOther || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mealLocationOther: e.target.value,
                    })
                  }
                  placeholder="Määritä missä..."
                  className="input-field"
                  disabled={isFormDisabled}
                />
              ) : (
                <div className="p-3 rounded-lg bg-white/5 text-secondary break-words">
                  {formData.mealLocationOther || "Ei määritelty."}
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
                    <button onClick={onClose} className="btn-secondary" disabled={isLoading}>
                      Peruuta
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaveDisabled}
                      className="btn-primary disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center "
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
