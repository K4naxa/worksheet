"use client";

import {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";

// components
import {
  Calendar,
  ConfirmationModal,
  Statistics,
  WorkDayModal,
  WorkDaysList,
} from "@/components";
// types
import { Workday, WorkStats, WorkPracticeSettings, User } from "@/types";
// server actions
import { saveWorkdayAction, deleteWorkdayAction } from "@/app/actions";
// utils
import { calculateStats } from "@/utils/stats";
import { BarChart3, CalendarDays, Plus, Settings, List } from "lucide-react";
import { start } from "repl";

export function HomePageClient({
  initialProfile,
  initialWorkdays,
}: {
  initialProfile: User;
  initialWorkdays: Workday[];
}) {
  // useTransition is for showing loading states without a full page reload
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const profile = initialProfile;
  const workdays = initialWorkdays;

  console.log("initial workdays:", initialWorkdays);

  useEffect(() => {
    console.log("Profile:", profile);
    console.log("Workdays:", workdays);
  }, [profile, workdays]);

  // Initialize stats with default values
  const [stats, setStats] = useState<WorkStats>({
    totalDays: 0,
    totalHours: 0,
    practiceProgress: 0,
    mealDistribution: { school: 0, work: 0, other: 0 },
  });

  const settings: WorkPracticeSettings = useMemo(() => {
    return {
      workDays: profile?.workdays || [],
      startDate: profile?.start_date
        ? new Date(profile.start_date).toISOString().split("T")[0]
        : undefined,
      endDate: profile?.end_date
        ? new Date(profile.end_date).toISOString().split("T")[0]
        : undefined,
    };
  }, [profile]);

  // Local state for modal and settings
  // This state is used to control the visibility of the modal and its data
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    selectedDate: string;
    existingWorkday?: Workday;
  }>({
    isOpen: false,
    selectedDate: "",
    existingWorkday: undefined,
  });

  // active tab state
  // This state is used to control which tab is currently active in the UI
  const [activeTab, setActiveTab] = useState<"calendar" | "workdays" | "stats">(
    "calendar"
  );

  // Update the stats whenever workdays or settings change
  // This effect recalculates the statistics based on the current workdays and settings
  useEffect(() => {
    setStats(calculateStats(workdays, settings));
  }, [workdays, settings]);

  // This hook is used to manage the scroll behavior of the body
  // It locks the scroll when either the main modal or the confirmation modal is open
  useEffect(() => {
    // If either the main modal OR the confirmation modal is open, lock the scroll.
    if (modalData.isOpen || showDeleteConfirmation) {
      document.body.style.overflow = "hidden";
    } else {
      // Only unlock if BOTH are closed.
      document.body.style.overflow = "";
    }

    // Cleanup function in case the component unmounts while a modal is open.
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalData.isOpen, showDeleteConfirmation]);

  const openModal = useCallback((date: string, workday?: Workday) => {
    setModalData({
      isOpen: true,
      selectedDate: date,
      existingWorkday: workday,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalData({
      isOpen: false,
      selectedDate: "",
      existingWorkday: undefined,
    });
  }, []);

  // date formatting function to display dates in Finnish format
  // This function formats a date string into a more readable format for the user
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fi-FI", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to handle saving a workday
  // This function is called when the user saves a workday from the modal
  // It uses startTransition to ensure the UI remains responsive while the save operation is in progress
  const handleSaveWorkday = async (workday: any) => {
    startTransition(async () => {
      const result = await saveWorkdayAction(workday);
      if (result.success) {
        await router.refresh(); // Refresh the page to get updated data

        closeModal(); // Close the modal after saving
      } else {
        console.error("Failed to save workday:", result.error);
        alert("Työpäivän tallentaminen epäonnistui.");
      }
    });
  };

  // Function to handle the deletion of a workday
  // This function is called when the user confirms the deletion of a workday
  // It uses startTransition to ensure the UI remains responsive while the delete operation is in progress
  const handleDeleteConfirm = async () => {
    if (!dateToDelete) return;

    try {
      startTransition(async () => {
        const result = await deleteWorkdayAction(dateToDelete);
        if (result.success) {
          await router.refresh(); // This triggers a soft refresh

          setShowDeleteConfirmation(false);
        } else {
          console.error("Error deleting work day:", result.error);
          alert("Työpäivän poistaminen epäonnistui.");
        }
      });
    } catch (error) {
      console.error("Error deleting work day:", error);
      alert("Työpäivän poistaminen epäonnistui.");
    } finally {
      closeModal();

      setDateToDelete(null); // Clear the date after deletion
    }
  };

  // Function handles the request to delete a workday
  // It opens a confirmation modal to confirm the deletion
  const handleDeleteRequest = (date: string) => {
    console.log("Request to delete date:", date);
    setDateToDelete(date); // Store the date we're about to delete
    setShowDeleteConfirmation(true); // Open the confirmation modal
  };

  // Function to handle date selection from the calendar
  // This function is called when a user selects a date from the calendar
  const handleDateSelect = (date: string) => {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const existingWorkday = workdays.find(
      (day) => new Date(day.date).toISOString().split("T")[0] === formattedDate
    );

    openModal(formattedDate, existingWorkday);
    console.log("existing workday:", existingWorkday);
    console.log("Selected date:", formattedDate);
  };

  // Function to handle editing an existing workday
  // This function is called when a user clicks to edit a workday from the list
  const handleEditWorkday = (workday: Workday) => {
    const formattedDate = new Date(workday.date).toISOString().split("T")[0];

    console.log("Selected date:", formattedDate);
    console.log("existing workday:", workday);

    openModal(formattedDate, workday);
  };

  const tabs = [
    { id: "calendar", label: "Kalenteri", icon: CalendarDays },
    { id: "workdays", label: "Työpäivät", icon: List },
    { id: "stats", label: "Tilastot", icon: BarChart3 },
  ];

  return (
    <div className="">
      <div className="container mx-auto p-4">
        {/* Header */}

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8 ">
          <div className="flex items-center space-x-4">
            <div className="glass-card rounded-2xl p-2">
              <div className="flex space-x-2">
                {tabs.map((tab) => {
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
                      (day) =>
                        new Date(day.date).toISOString().split("T")[0] ===
                        todayDate
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
                  <h3 className="text-lg font-semibold text-primary mb-4">
                    Pikavinkit
                  </h3>
                  <ul className="space-y-2 text-secondary text-sm">
                    <li>
                      • Klikkaa mitä tahansa päivää lisätäksesi tai nähdäksesi
                      työn tiedot
                    </li>
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
              <WorkDaysList
                workDays={workdays}
                onEdit={handleEditWorkday}
                onDelete={handleDeleteRequest}
              />
            </div>
          )}

          {activeTab === "stats" && <Statistics stats={stats} />}
        </div>

        {/* Work Day Modal */}
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
              <p className="text-center text-lg">
                Oletko varma, että haluat poistaa työpäivän:
              </p>
              <p className="text-center font-bold text-primary text-xl my-3 bg-white/10 p-3 rounded-lg">
                {dateToDelete ? formatDate(dateToDelete) : ""}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Tätä toimintoa ei voi peruuttaa.
              </p>
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
