"use client";

import { AlertOctagon, Briefcase, Calendar, Edit, LinkIcon, OctagonIcon, Save, Settings, User2 } from "lucide-react";

import { useState, useEffect, useTransition } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { ConfirmationModal } from "@/components";

import { updateUserProfileAction, deleteUserAccountAction } from "../../actions";
import { RegistrationComplition, User } from "@/types";

export function ProfilePageClient({ initialProfile }: { initialProfile: User }) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local states for UI Logic
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // ** Work Settings States **//

  const [workplaceFormData, setWorkplaceFormData] = useState<RegistrationComplition>({
    startDate: initialProfile.start_date ? new Date(initialProfile.start_date).toISOString().split("T")[0] : "",
    endDate: initialProfile.end_date ? new Date(initialProfile.end_date).toISOString().split("T")[0] : "",
    company: initialProfile.company || "",
    instructor: initialProfile.instructor || "",
    workdays: initialProfile.workdays || [],
  });

  // ** Keycloak account management **//
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
    setWorkplaceFormData((prev) => ({
      ...prev,
      workdays: prev.workdays.includes(dayValue)
        ? prev.workdays.filter((d) => d !== dayValue)
        : [...prev.workdays, dayValue].sort(),
    }));
  };

  const validateAndSubmit = async () => {
    const { company, instructor, startDate, endDate, workdays } = workplaceFormData;

    if (!company.trim()) {
      setError("Yrityksen nimi on pakollinen.");
      return;
    }
    if (!instructor.trim()) {
      setError("Työn ohjaajan nimi on pakollinen.");
      return;
    }
    if (!startDate) {
      setError("Aloituspäivä on pakollinen.");
      return;
    }
    if (!endDate) {
      setError("Viimeinen työpäivä on pakollinen.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError("Viimeisen työpäivän on oltava aloituspäivän jälkeen.");
      return;
    }
    if (workdays.length === 0) {
      setError("Valitse vähintään yksi työpäivä viikossa.");
      return;
    }

    await handleSubmit();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    startTransition(async () => {
      const result = await updateUserProfileAction(workplaceFormData);
      if (result.success) {
        setIsEditing(false);
        setIsLoading(false);
        router.refresh(); // Refresh the page to reflect changes
      } else {
        setError(result.error as string);
        setIsLoading(false);
        console.error("Profile update failed:", result.error);
      }
    });
  };

  const handleEditingCancel = () => {
    setIsEditing(false);
    setError(null);
    setWorkplaceFormData({
      startDate: initialProfile.start_date ? new Date(initialProfile.start_date).toISOString().split("T")[0] : "",
      endDate: initialProfile.end_date ? new Date(initialProfile.end_date).toISOString().split("T")[0] : "",
      workdays: initialProfile.workdays || [],
      company: initialProfile.company || "",
      instructor: initialProfile.instructor || "",
    });
  };

  const handleAccountDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmAccountDelete = async () => {
    startTransition(async () => {
      const result = await deleteUserAccountAction();
      if (result.success) {
        // After successful deletion on the backend, sign the user out on the client.
        await signOut({ callbackUrl: "/login" });
      } else {
        alert(result.error);
        setShowDeleteConfirmation(false);
      }
    });
  };

  useEffect(() => {
    // Reset error message after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [error]);

  return (
    <div className=" flex flex-col gap-12 items-center justify-center p-4 h-full">
      {/* Work Settings */}
      <div className="glass-card rounded-2xl w-full max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-6 border-b border-white/20 flex-shrink-0">
          {/* Left side: Title and Date */}
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">Harjoittelun asetukset</h2>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit Button: Shown when viewing an existing entry and not in edit mode */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center space-x-2"
                aria-label="Muokkaa työpäivää"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Muokkaa</span>
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && <div className="bg-red-500/20 text-red-500 p-2 rounded-b-lg">{error}</div>}
        <div className="p-6 space-y-6 ">
          {/* Company and Instructor */}
          <div className=" grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* company Section */}
            <div className="">
              <div className="flex items-center space-x-2 mb-1">
                <Briefcase className="w-4 h-4 text-muted" />
                <label className="block text-sm text-secondary">Työn tarjoavan yrityksen nimi:</label>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={workplaceFormData.company}
                  onChange={(e) =>
                    setWorkplaceFormData({
                      ...workplaceFormData,
                      company: e.target.value,
                    })
                  }
                  placeholder="Työn tarjoavan yrityksen nimi"
                  className="input-field"
                  required
                />
              ) : (
                <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px]">
                  {workplaceFormData.company || "Ei määritetty"}
                </p>
              )}
            </div>

            {/* Instructor Section */}
            <div className="">
              <div className="flex items-center mb-1">
                <User2 className="w-4 h-4 text-muted" />
                <label className="block text-sm text-secondary">Työn ohjaajan nimi:</label>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={workplaceFormData.instructor}
                  onChange={(e) =>
                    setWorkplaceFormData({
                      ...workplaceFormData,
                      instructor: e.target.value,
                    })
                  }
                  placeholder="Sinua ohjaavan henkilön nimi"
                  className="input-field"
                  required
                />
              ) : (
                <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px]">
                  {workplaceFormData.instructor || "Ei määritetty"}
                </p>
              )}
            </div>
          </div>
          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted" />
              <label className="text-primary font-medium">Harjoittelun ajankohta</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-secondary mb-1">Alkupäivä</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={workplaceFormData.startDate}
                    onChange={(e) =>
                      setWorkplaceFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    max={workplaceFormData.endDate || undefined} // Ensure start date is before end date
                    className="input-field"
                  />
                ) : (
                  <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px]">
                    {workplaceFormData.startDate
                      ? new Date(workplaceFormData.startDate).toLocaleDateString("fi-FI")
                      : "Ei määritetty"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1">Loppupäivä</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={workplaceFormData.endDate}
                    onChange={(e) =>
                      setWorkplaceFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    min={workplaceFormData.startDate || undefined} // Ensure end date is after start date
                    className="input-field"
                  />
                ) : (
                  <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px]">
                    {workplaceFormData.endDate
                      ? new Date(workplaceFormData.endDate).toLocaleDateString("fi-FI")
                      : "Ei määritetty"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Work Days */}
          <div className="space-y-3">
            <label className="text-primary font-medium">Työpäivät viikossa</label>
            <div className="flex gap-2 flex-wrap w-full md:grid grid-cols-7">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => isEditing && handleWorkDayToggle(day.value)}
                  disabled={!isEditing}
                  className={`p-3 min-w-14 rounded-xl border-2 transition-all text-sm ${
                    workplaceFormData.workdays.includes(day.value)
                      ? "border-primary-500 bg-primary-500/20 text-primary"
                      : isEditing
                      ? "border-white/20 glass-card text-secondary"
                      : "border-transparent bg-black/10 text-muted "
                  } ${isEditing ? "glass-card-hover" : "cursor-default"}`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="p-6 border-t border-white/20 flex-shrink-0">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex  gap-4 flex-wrap ml-auto">
                <button onClick={handleEditingCancel} className="btn-secondary" disabled={isEditing ? false : true}>
                  Peruuta
                </button>
                <button
                  onClick={validateAndSubmit}
                  disabled={
                    !workplaceFormData.company.trim() ||
                    !workplaceFormData.instructor.trim() ||
                    workplaceFormData.workdays.length === 0 ||
                    !workplaceFormData.startDate ||
                    !workplaceFormData.endDate ||
                    isLoading
                  }
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
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
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="glass-card rounded-2xl w-full max-w-6xl">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <User2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">Profiilitiedot</h2>
          </div>
        </div>

        {/* Add links to change keycloak credentials */}
        <div className="p-6 space-y-4">
          <p className="text-primary ">
            Yleisten Käyttäjätietojen muokkaus tapahtuu Keycloak välityksellä. <br />
            Voit muuttaa esimerkiksi sähköpostiosoitettasi, nimeäsi ja salasanaasi.
            <br />
            <br />
            <strong>
              Huomioithan, että profiilitietojen muutosten päivittymisessä sivulle on noin 5 minuutin viive.
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
            Alla olevasta painikkeesta voit poistaa käyttäjäprofiilisi. Tämä poistaa myös kaikki siihen liittyvät
            tiedot, kuten harjoittelun asetukset ja työpäivät.
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
