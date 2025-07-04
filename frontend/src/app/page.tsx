"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Statistics,
  WorkDayModal,
  WorkDaysList,
  SettingsModal,
} from "@/components";
import { Workday, WorkStats, WorkPracticeSettings } from "@/types";
import {
  saveWorkday,
  deleteWorkday,
  saveWorkPracticeSettings,
} from "@/utils/storage";
import { calculateStats } from "@/utils/stats";
import { BarChart3, CalendarDays, Plus, Settings, List } from "lucide-react";
import { signOut } from "next-auth/react";
import { useUser } from "@/context/UserContext";

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

  const settings = {
    workDays: userProfile?.workdays || [],
  };

  // Local state for modal and settings
  // This state is used to control the visibility of the modal and its data
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    selectedDate: string;
    existingWorkday?: Workday;
  }>({
    isOpen: false,
    selectedDate: "",
    existingWorkday: undefined,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "workdays" | "stats">(
    "calendar"
  );

  useEffect(() => {
    setStats(calculateStats(workdays, settings));
    console.log("User data:", userProfile);
  }, [userProfile]);

  const handleSaveWorkday = async (workday: Workday) => {
    try {
      // Save the work day to server
      await saveWorkday(workday);

      // after Succesful save, update user profile
      await refetchProfile();

      setModalData({
        selectedDate: "",
        existingWorkday: undefined,
        isOpen: false,
      });
    } catch (error) {
      console.error("Error saving work day:", error);
      alert("Työpäivän tallentaminen epäonnistui. Yritä uudelleen.");
      return;
    }
  };

  const handleDeleteWorkday = async (date: string) => {
    if (window.confirm("Haluatko varmasti poistaa tämän työpäivän?")) {
      await deleteWorkday(date);

      // after Succesful delete, update user profile
      await refetchProfile();

      setModalData({
        ...modalData,
        selectedDate: "",
        existingWorkday: undefined,
        isOpen: false,
      });
    }
  };

  const handleDateSelect = (date: string) => {
    const formattedDate = new Date(date).toISOString().split("T")[0];
    const existingWorkday = workdays.find(
      (day) => new Date(day.date).toISOString().split("T")[0] === formattedDate
    );

    setModalData({
      isOpen: true,
      selectedDate: formattedDate,
      existingWorkday,
    });
    console.log("existing workday:", existingWorkday);
    console.log("Selected date:", formattedDate);
  };

  const handleEditWorkday = (workday: Workday) => {
    const formattedDate = new Date(workday.date).toISOString().split("T")[0];

    console.log("Selected date:", formattedDate);
    console.log("existing workday:", workday);
    setModalData({
      isOpen: true,
      selectedDate: formattedDate,
      existingWorkday: workday,
    });
  };

  const handleSaveSettings = (newSettings: WorkPracticeSettings) => {
    saveWorkPracticeSettings(newSettings);
    setStats(calculateStats(workdays, newSettings));
  };

  const tabs = [
    { id: "calendar", label: "Kalenteri", icon: CalendarDays },
    { id: "workdays", label: "Työpäivät", icon: List },
    { id: "stats", label: "Tilastot", icon: BarChart3 },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--gradient-background)" }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Työharjoittelu Seuranta
            </h1>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-xl glass-card glass-card-hover text-primary transition-colors"
              title="Asetukset"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              className="p-3 rounded-xl glass-card glass-card-hover text-primary transition-colors"
              onClick={() => {
                signOut();
              }}
            >
              Kirjaudu ulos
            </button>
          </div>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Seuraa päivittäisiä aktiviteettejasi, oppimistasi ja edistymistäsi
            työharjoittelun aikana
          </p>

          <p>Tämän hetkisten työpäivien määrä: {workdays.length}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
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
                onDelete={handleDeleteWorkday}
              />
            </div>
          )}

          {activeTab === "stats" && <Statistics stats={stats} />}
        </div>

        {/* Work Day Modal */}
        <WorkDayModal
          modalData={modalData}
          onClose={() => {
            setModalData({
              isOpen: false,
              selectedDate: "",
              existingWorkday: undefined,
            });
          }}
          onSave={handleSaveWorkday}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveSettings}
          currentSettings={settings}
        />
      </div>
    </div>
  );
}
