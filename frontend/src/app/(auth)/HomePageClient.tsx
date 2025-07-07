"use client";

import { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, CalendarDays, Plus, List } from "lucide-react";

// Components
import { Calendar, ConfirmationModal, Statistics, WorkDayModal, WorkDaysList } from "@/components";
// Types
import { Workday, WorkStats, WorkPracticeSettings, User } from "@/types";
// Server Actions
import { saveWorkdayAction, deleteWorkdayAction } from "@/app/actions";
// Utils
import { calculateStats } from "@/utils/stats";

// ============================================================================
// Constants
// ============================================================================

/**
 * Configuration for the main navigation tabs on the home page.
 */
const TABS = [
  { id: "calendar", label: "Kalenteri", icon: CalendarDays },
  { id: "workdays", label: "Työpäivät", icon: List },
  { id: "stats", label: "Tilastot", icon: BarChart3 },
];

// ============================================================================
// Component
// ============================================================================

/**
 * Renders the main client-side interface for the home page.
 * This component manages all UI state, such as active tabs and modals,
 * and handles user interactions like creating, editing, and deleting workdays.
 *
 * @param {User} initialProfile - The user's profile data, fetched on the server.
 * @param {Workday[]} initialWorkdays - The user's initial list of workdays, fetched on the server.
 */
export function HomePageClient({
  initialProfile,
  initialWorkdays,
}: {
  initialProfile: User;
  initialWorkdays: Workday[];
}) {
  // --------------------------------------------------------------------------
  // Hooks
  // --------------------------------------------------------------------------

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --------------------------------------------------------------------------
  // Props & Derived State
  // --------------------------------------------------------------------------

  // We use props directly for server data to ensure they are always up-to-date after a `router.refresh()`.
  const profile = initialProfile;
  const workdays = initialWorkdays;

  /**
   * Memoized settings derived from the user's profile.
   * `useMemo` prevents this object from being recreated on every render, which
   * avoids infinite loops in `useEffect` hooks that depend on it.
   */
  const settings: WorkPracticeSettings = useMemo(() => {
    return {
      workDays: profile?.workdays || [],
      startDate: profile?.start_date ? new Date(profile.start_date).toISOString().split("T")[0] : undefined,
      endDate: profile?.end_date ? new Date(profile.end_date).toISOString().split("T")[0] : undefined,
    };
  }, [profile]);

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** State to control the currently visible tab ('calendar', 'workdays', or 'stats'). */
  const [activeTab, setActiveTab] = useState<"calendar" | "workdays" | "stats">("calendar");

  /** State to manage the `WorkDayModal`'s visibility and data. */
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    selectedDate: string;
    existingWorkday?: Workday;
  }>({
    isOpen: false,
    selectedDate: "",
    existingWorkday: undefined,
  });

  /** State for the delete confirmation modal. */
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  /** State to track which date is pending deletion. */
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  /** State to hold calculated statistics. */
  const [stats, setStats] = useState<WorkStats>({
    totalDays: 0,
    totalHours: 0,
    practiceProgress: 0,
    mealDistribution: { school: 0, work: 0, other: 0 },
  });

  /** Dedicated loading state for the deletion process to provide feedback on the confirmation button. */
  const [isDeleting, setIsDeleting] = useState(false);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  /**
   * Recalculates statistics whenever the list of workdays or user settings change.
   */
  useEffect(() => {
    setStats(calculateStats(workdays, settings));
  }, [workdays, settings]);

  /**
   * Manages the body's scroll lock when any modal is open to prevent background scrolling.
   */
  useEffect(() => {
    const isModalOpen = modalData.isOpen || showDeleteConfirmation;
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    // Cleanup function to reset scroll on component unmount.
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalData.isOpen, showDeleteConfirmation]);

  // --------------------------------------------------------------------------
  // Modal Handlers
  // --------------------------------------------------------------------------

  /**
   * Opens the WorkDayModal with data for a specific date.
   * @param {string} date - The selected date string (YYYY-MM-DD).
   * @param {Workday} [workday] - The existing workday data if editing, otherwise undefined.
   */
  const openModal = useCallback((date: string, workday?: Workday) => {
    setModalData({
      isOpen: true,
      selectedDate: date,
      existingWorkday: workday,
    });
  }, []);

  /** Closes the WorkDayModal and resets its data. */
  const closeModal = useCallback(() => {
    setModalData({ isOpen: false, selectedDate: "", existingWorkday: undefined });
  }, []);

  // --------------------------------------------------------------------------
  // Data & Interaction Handlers
  // --------------------------------------------------------------------------

  /**
   * Handles selecting a date from the calendar, finding any existing workday
   * for that date, and opening the modal.
   * @param {string} date - The selected date string (YYYY-MM-DD).
   */
  const handleDateSelect = (date: string) => {
    const existingWorkday = workdays.find((day) => new Date(day.date).toISOString().split("T")[0] === date);
    openModal(date, existingWorkday);
  };

  /**
   * Handles the "Edit" action from the `WorkDaysList`, opening the modal with the
   * specified workday's data.
   * @param {Workday} workday - The workday object to be edited.
   */
  const handleEditWorkday = (workday: Workday) => {
    const formattedDate = new Date(workday.date).toISOString().split("T")[0];
    openModal(formattedDate, workday);
  };

  /**
   * Initiates the delete process by setting the target date and showing the confirmation modal.
   * @param {string} date - The date of the workday to be deleted.
   */
  const handleDeleteRequest = (date: string) => {
    setDateToDelete(date);
    setShowDeleteConfirmation(true);
  };

  // --------------------------------------------------------------------------
  // Server Action Handlers
  // --------------------------------------------------------------------------

  /**
   * Saves or updates a workday by calling a server action.
   * Closes the modal and refreshes the page data on success.
   * @param {Workday | CreateWorkDay} workday - The workday data to save.
   */
  const handleSaveWorkday = async (workday: any) => {
    startTransition(async () => {
      const result = await saveWorkdayAction(workday);
      if (result.success) {
        closeModal();
        router.refresh();
      } else {
        console.error("Failed to save workday:", result.error);
        alert("Työpäivän tallentaminen epäonnistui.");
      }
    });
  };

  /**
   * Confirms and executes the deletion of a workday via a server action.
   * It only closes the modals on a successful deletion, providing a better user experience.
   */
  const handleDeleteConfirm = async () => {
    if (!dateToDelete) return;

    setIsDeleting(true);

    try {
      startTransition(async () => {
        const result = await deleteWorkdayAction(dateToDelete);

        if (result.success) {
          router.refresh(); // Refresh data first

          setShowDeleteConfirmation(false);
        } else {
          console.error("Error deleting work day:", result.error);
          alert("Työpäivän poistaminen epäonnistui. Yritä uudelleen.");
        }
        setIsDeleting(false);
      });
    } finally {
      setIsDeleting(false);
      setDateToDelete(null);

      closeModal();
    }
  };

  // --------------------------------------------------------------------------
  // Helper Functions
  // --------------------------------------------------------------------------

  /**
   * Formats a date string for display in the UI (e.g., in the delete confirmation modal).
   * @param {string} dateStr - The date string to format.
   * @returns {string} A localized, readable date string.
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
  //

  return (
    <div className="">
      <div className="container mx-auto p-4">
        {/* Header */}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 ">
          <div className="flex items-center space-x-4">
            <div className="glass-card rounded-2xl p-2">
              <div className="flex space-x-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      disabled={isPending}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`
                        flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all
                        ${
                          activeTab === tab.id
                            ? "text-white shadow-lg bg-gradient-primary"
                            : "text-secondary glass-card-hover "
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "calendar" && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Calendar
                  userWorkdays={workdays}
                  workDays={profile.workdays || []}
                  onDateSelect={handleDateSelect}
                  selectedDate={modalData.selectedDate}
                />
              </div>
              <div className="space-y-6">
                <button
                  disabled={isPending}
                  onClick={() => {
                    const todayDate = new Date().toISOString().split("T")[0];
                    const existingWorkday = workdays.find(
                      (day) => new Date(day.date).toISOString().split("T")[0] === todayDate
                    );
                    setModalData({
                      isOpen: true,
                      selectedDate: todayDate,
                      existingWorkday,
                    });
                  }}
                  className="w-full p-4 btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Lisää tämän päivän työ</span>
                </button>

                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Pikavinkit</h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li>• Klikkaa mitä tahansa päivää lisätäksesi tai nähdäksesi työn tiedot</li>
                    <li>• Vihreät päivät näyttävät suoritetut työpäivät</li>
                    <li>• Seuraa edistymistäsi Tilastot-välilehdessä</li>
                    <li>• Määritä harjoittelun ajankohtaa Profiili sivulla</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workdays" && (
            <div className="max-w-4xl mx-auto">
              <WorkDaysList workDays={workdays} onEdit={handleEditWorkday} onDelete={handleDeleteRequest} />
            </div>
          )}

          {activeTab === "stats" && <Statistics stats={stats} />}
        </div>

        {/* Modals */}
        <WorkDayModal
          modalData={modalData}
          onClose={closeModal}
          onSave={handleSaveWorkday}
          onDeleteRequest={handleDeleteRequest}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDeleteConfirm}
          message={
            <div>
              <p className="text-center text-lg">Oletko varma, että haluat poistaa työpäivän:</p>
              <p className="text-center font-bold text-primary text-xl my-3 bg-white/10 p-3 rounded-lg">
                {dateToDelete ? formatDate(dateToDelete) : ""}
              </p>
              <p className="text-center text-sm text-muted-foreground">Tätä toimintoa ei voi peruuttaa.</p>
            </div>
          }
          title="Poista työpäivä"
          confirmText="Poista"
          cancelText="Peruuta"
          variant="default"
        />
      </div>
    </div>
  );
}
