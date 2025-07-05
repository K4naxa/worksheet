"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  ConfirmationModal,
  Statistics,
  WorkDayModal,
  WorkDaysList,
} from "@/components";
import { Workday, WorkStats, WorkPracticeSettings } from "@/types";
import { saveWorkday, deleteWorkday } from "@/utils/storage";
import { calculateStats } from "@/utils/stats";
import { BarChart3, CalendarDays, Plus, Settings, List } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton";

export default function Home() {
  // Pull the true user data from context
  const { userProfile, refetchProfile, isLoading } = useUser();
  const workdays = userProfile?.userWorkdays || [];

  // Initialize stats with default values
  // This will be updated once the user profile is fetched
  const [stats, setStats] = useState<WorkStats>({
    totalDays: 0,
    totalHours: 0,
    practiceProgress: 0,
    mealDistribution: { school: 0, work: 0, other: 0 },
  });

  const settings: WorkPracticeSettings = {
    workDays: userProfile?.workdays || [],
    startDate: userProfile?.start_date
      ? new Date(userProfile.start_date).toISOString().split("T")[0]
      : undefined,
    endDate: userProfile?.end_date
      ? new Date(userProfile.end_date).toISOString().split("T")[0]
      : undefined,
  };

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
  const [activeTab, setActiveTab] = useState<"calendar" | "workdays" | "stats">(
    "calendar"
  );

  useEffect(() => {
    setStats(calculateStats(workdays, settings));
    console.log("User data:", userProfile);
  }, [userProfile]);

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
  }, []); // Empty dependency array means this function is created only once.

  const closeModal = useCallback(() => {
    setModalData({
      isOpen: false,
      selectedDate: "",
      existingWorkday: undefined,
    });
  }, []); // Empty dependency array means this function is created only once.

  // ** Loading skeleton **//
  // If the context is loading the initial profile, or if the profile hasn't arrived yet,
  // show the skeleton UI.
  // MUST BE CALLED AFTER ALL OF THE HOOKS TO SATISFY REACT HOOKS RULES
  if (isLoading || !userProfile) {
    return <HomePageSkeleton />;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fi-FI", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSaveWorkday = async (workday: any) => {
    try {
      // Save the work day to server
      await saveWorkday(workday);

      // after Succesful save, update user profile
      await refetchProfile();

      closeModal();
    } catch (error) {
      console.error("Error saving work day:", error);
      alert("Työpäivän tallentaminen epäonnistui. Yritä uudelleen.");
      return;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!dateToDelete) return; // Safety check

    try {
      await deleteWorkday(dateToDelete); // Call your API service
      await refetchProfile();

      // Close ALL modals after the operation is successful.
      setShowDeleteConfirmation(false);
      closeModal(); // This closes the WorkDayModal
    } catch (error) {
      console.error("Error deleting work day:", error);
      alert("Työpäivän poistaminen epäonnistui.");
      // You might want to close the confirmation modal even on error.
      setShowDeleteConfirmation(false);
    }
  };

  const handleDeleteRequest = (date: string) => {
    console.log("Request to delete date:", date);
    setDateToDelete(date); // Store the date we're about to delete
    setShowDeleteConfirmation(true); // Open the confirmation modal
  };

  const handleDateSelect = (date: string) => {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const existingWorkday = workdays.find(
      (day) => new Date(day.date).toISOString().split("T")[0] === formattedDate
    );

    openModal(formattedDate, existingWorkday);
    console.log("existing workday:", existingWorkday);
    console.log("Selected date:", formattedDate);
  };

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
        <div className="text-center mb-8">
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Seuraa päivittäisiä aktiviteettejasi, oppimistasi ja edistymistäsi
            työharjoittelun aikana
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="glass-card rounded-2xl p-2">
              <div className="flex space-x-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
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
                  workDays={workdays}
                  onDateSelect={handleDateSelect}
                  selectedDate={modalData.selectedDate}
                />
              </div>
              <div className="space-y-6">
                <button
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
                    <li>• Määritä harjoittelun ajankohta asetuksista</li>
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
