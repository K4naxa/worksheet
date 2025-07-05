"use client";

import {
  AlertOctagon,
  Calendar,
  LinkIcon,
  OctagonIcon,
  Save,
  Settings,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { ConfirmationModal } from "@/components";
import { deleteProfile } from "@/services/api";

export default function Home() {
  const { userProfile, refetchProfile } = useUser();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workdays, setWorkdays] = useState<number[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const keycloakAccountUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/account/`;

  const weekDays = [
    { value: 1, label: "Maanantai" },
    { value: 2, label: "Tiistai" },
    { value: 3, label: "Keskiviikko" },
    { value: 4, label: "Torstai" },
    { value: 5, label: "Perjantai" },
    { value: 6, label: "Lauantai" },
    { value: 0, label: "Sunnuntai" },
  ];

  const handleWorkDayToggle = (dayValue: number) => {
    setWorkdays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue].sort()
    );
  };

  const handleSave = () => {};

  const handleAccountDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmAccountDelete = async () => {
    try {
      console.log("Account deletion confirmed, deleting user profile...");
      // This API call deletes the user from Keycloak and DB.
      await deleteProfile();

      // error and trigger a global sign-out.
      await refetchProfile();

      console.log("Profile refetch initiated after deletion.");
    } catch (error) {
      // Handle any errors that occur during the deletion process
      console.error("Error during the account deletion process:", error);
      alert("Käyttäjän poistaminen epäonnistui.");
    }
  };

  useEffect(() => {
    if (userProfile) {
      setStartDate(
        userProfile.start_date
          ? new Date(userProfile.start_date).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        userProfile.end_date
          ? new Date(userProfile.end_date).toISOString().split("T")[0]
          : ""
      );
      setWorkdays(userProfile.workdays || []);
    }
  }, [userProfile]);

  return (
    <div className=" flex flex-col gap-12 items-center justify-center p-4 h-full">
      {/* Work Settings */}
      <div className="glass-card rounded-2xl w-full max-w-6xl">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">
              Harjoittelun asetukset
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">
                Harjoittelun ajankohta
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-secondary mb-1">
                  Alkupäivä
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1">
                  Loppupäivä
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Work Days */}
          <div className="space-y-3">
            <label className="text-primary font-medium">
              Työpäivät viikossa
            </label>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleWorkDayToggle(day.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm ${
                    workdays.includes(day.value)
                      ? "border-primary-500 bg-primary-500/20 text-primary"
                      : "border-white/20 glass-card text-secondary glass-card-hover"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Tallenna</span>
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="glass-card rounded-2xl w-full max-w-6xl">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">Profiilitiedot</h2>
          </div>
        </div>

        {/* Add links to change keycloak credentials */}
        <div className="p-6 space-y-4">
          <p className="text-primary ">
            Yleisten Käyttäjätietojen muokkaus tapahtuu Keycloak välityksellä.{" "}
            <br />
            Voit muuttaa esimerkiksi sähköpostiosoitettasi, nimeäsi ja
            salasanaasi.
            <br />
            <br />
            <strong>
              Huomioithan, että profiilitietojen muutosten päivittymisessä
              sivulle on noin 5 minuutin viive.
            </strong>
          </p>
          <div className="space-y-2">
            {/* --- THE LINK --- */}
            <a
              href={keycloakAccountUrl}
              target="_blank" // Open in a new tab so the user doesn't lose their place
              rel="noopener noreferrer" // Security best practice for opening new tabs
              className="btn-primary inline-flex items-center space-x-2" // Use inline-flex for alignment
            >
              <span>Siirry Keycloak-profiiliin</span>
              <LinkIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Profile Deletion */}
      <div className="glass-card border-2 border-red-500 rounded-2xl w-full max-w-6xl">
        <div className="flex items-center justify-between p-6 border-b border-red-500/20">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertOctagon className="w-5 h-5 " />
            <h2 className="text-xl font-bold ">Profiilin Poisto</h2>
          </div>
        </div>

        {/* Add links to change keycloak credentials */}
        <div className="p-6 space-y-4">
          <p className="text-primary ">
            Alla olevasta painikkeesta voit poistaa käyttäjäprofiilisi. Tämä
            poistaa myös kaikki siihen liittyvät tiedot, kuten harjoittelun
            asetukset ja työpäivät.
          </p>
          <div className="space-y-2">
            {/* Todo: Add link to Keycloak user management */}
            <button
              onClick={handleAccountDelete}
              className="px-6 py-3 rounded-xl font-medium transition-all bg-red-500 text-primary hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:shadow "
            >
              Poista Käyttäjä
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmAccountDelete}
        message={
          <>
            Oletko varma, että haluat poistaa käyttäjäprofiilisi?
            <br />
            <strong>Tätä toimintoa ei voi peruuttaa!</strong>
          </>
        }
        title="Poista käyttäjäprofiili"
        confirmText="Poista"
        cancelText="Peruuta"
        variant="danger"
      />
    </div>
  );
}
