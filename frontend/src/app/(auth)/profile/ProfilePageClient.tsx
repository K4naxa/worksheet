"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AlertOctagon, Briefcase, Calendar, Edit, LinkIcon, Save, Settings, User2 } from "lucide-react";

import { ConfirmationModal } from "@/components";
import { updateUserProfileAction, deleteUserAccountAction } from "../../actions";
import type { RegistrationComplition, User } from "@/types";

// --- Constants defined outside the component ---
// This prevents them from being recreated on every render, improving performance.

/**
 * URL for the user's Keycloak account management page.
 * Constructed from environment variables.
 */
const keycloakAccountUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/account/`;

/**
 * An array representing the days of the week for the selection UI.
 */
const weekDays = [
  { value: 1, label: "Maanantai" },
  { value: 2, label: "Tiistai" },
  { value: 3, label: "Keskiviikko" },
  { value: 4, label: "Torstai" },
  { value: 5, label: "Perjantai" },
  { value: 6, label: "Lauantai" },
  { value: 0, label: "Sunnuntai" },
];

/**
 * A client component for displaying and managing user profile and internship settings.
 * @param {object} props - The component props.
 * @param {User} props.initialProfile - The user's profile data, fetched on the server.
 */
export function ProfilePageClient({ initialProfile }: { initialProfile: User }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- Component State ---

  /** Manages the form data for internship settings. Initialized with server-provided data. */
  const [formData, setFormData] = useState<RegistrationComplition>({
    startDate: initialProfile.start_date ? new Date(initialProfile.start_date).toISOString().split("T")[0] : "",
    endDate: initialProfile.end_date ? new Date(initialProfile.end_date).toISOString().split("T")[0] : "",
    company: initialProfile.company || "",
    instructor: initialProfile.instructor || "",
    workdays: initialProfile.workdays || [],
  });

  /** Controls the UI's edit mode. */
  const [isEditing, setIsEditing] = useState(false);

  /** Stores any validation or server error messages to display to the user. */
  const [error, setError] = useState<string | null>(null);

  /** Controls the visibility of the account deletion confirmation modal. */
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // --- Effects ---

  /**
   * Effect to automatically clear the error message after a 5-second delay.
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer); // Cleanup timer on unmount or if error changes
    }
  }, [error]);

  // --- Event Handlers ---

  /** Toggles a day's selection in the workdays array. */
  const handleWorkDayToggle = (dayValue: number) => {
    setFormData((prev) => ({
      ...prev,
      workdays: prev.workdays.includes(dayValue)
        ? prev.workdays.filter((d) => d !== dayValue)
        : [...prev.workdays, dayValue].sort(),
    }));
  };

  /** Handles the form submission process, including validation and server action call. */
  const handleSubmit = () => {
    // Client-side validation
    const { company, instructor, startDate, endDate, workdays } = formData;
    if (!company.trim()) return setError("Yrityksen nimi on pakollinen.");
    if (!instructor.trim()) return setError("Työn ohjaajan nimi on pakollinen.");
    if (!startDate) return setError("Aloituspäivä on pakollinen.");
    if (!endDate) return setError("Viimeinen työpäivä on pakollinen.");
    if (new Date(startDate) >= new Date(endDate)) return setError("Loppupäivän on oltava alkupäivän jälkeen.");
    if (workdays.length === 0) return setError("Valitse vähintään yksi työpäivä.");

    setError(null); // Clear previous errors

    startTransition(async () => {
      const result = await updateUserProfileAction(formData);
      if (result.success) {
        setIsEditing(false);
        router.refresh(); // Refresh page to get fresh server data
      } else {
        setError(result.error as string);
        console.error("Profile update failed:", result.error);
      }
    });
  };

  /** Cancels editing mode and reverts form data to its initial state. */
  const handleEditingCancel = () => {
    setIsEditing(false);
    setError(null);
    setFormData({
      startDate: initialProfile.start_date ? new Date(initialProfile.start_date).toISOString().split("T")[0] : "",
      endDate: initialProfile.end_date ? new Date(initialProfile.end_date).toISOString().split("T")[0] : "",
      workdays: initialProfile.workdays || [],
      company: initialProfile.company || "",
      instructor: initialProfile.instructor || "",
    });
  };

  /** Initiates the account deletion process by showing the confirmation modal. */
  const handleAccountDelete = () => {
    setShowDeleteConfirmation(true);
  };

  /** Confirms and executes the account deletion server action. */
  const confirmAccountDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAccountAction();
      if (result.success) {
        await signOut({ callbackUrl: "/login" });
      } else {
        alert(result.error);
        setShowDeleteConfirmation(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 md:gap-12 items-center justify-center p-4 h-full">
      {/* --- Harjoittelun Asetukset (Internship Settings) Card --- */}
      <div className="glass-card rounded-2xl w-full max-w-4xl">
        <div className="flex items-center justify-between gap-4 p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-primary">Harjoittelun asetukset</h2>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
              aria-label="Muokkaa asetuksia"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Muokkaa</span>
            </button>
          )}
        </div>

        {error && <div className="m-4 bg-red-500/20 text-red-400 p-3 rounded-lg text-center font-medium">{error}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="p-6 space-y-6"
        >
          {/* Company and Instructor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center space-x-2 mb-2 text-sm text-secondary">
                <Briefcase className="w-4 h-4" />
                <span>Työn tarjoavan yrityksen nimi:</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Yrityksen nimi"
                  className="input-field"
                  required
                />
              ) : (
                <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px] flex items-center">
                  {formData.company || "Ei määritetty"}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center space-x-2 mb-2 text-sm text-secondary">
                <User2 className="w-4 h-4" />
                <span>Työn ohjaajan nimi:</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Ohjaajan nimi"
                  className="input-field"
                  required
                />
              ) : (
                <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px] flex items-center">
                  {formData.instructor || "Ei määritetty"}
                </p>
              )}
            </div>
          </div>
          {/* Date Range */}
          <div className="space-y-4">
            <p className="flex items-center space-x-2 text-primary font-medium">
              <Calendar className="w-5 h-5" />
              <span>Harjoittelun ajankohta</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-secondary mb-1">Alkupäivä</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    max={formData.endDate || undefined}
                    className="input-field"
                  />
                ) : (
                  <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px] flex items-center">
                    {formData.startDate ? new Date(formData.startDate).toLocaleDateString("fi-FI") : "Ei määritetty"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-secondary mb-1">Loppupäivä</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || undefined}
                    className="input-field"
                  />
                ) : (
                  <p className="text-primary p-3 rounded-lg bg-black/10 min-h-[44px] flex items-center">
                    {formData.endDate ? new Date(formData.endDate).toLocaleDateString("fi-FI") : "Ei määritetty"}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Work Days */}
          <div className="space-y-3">
            <p className="text-primary font-medium">Työpäivät viikossa</p>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => isEditing && handleWorkDayToggle(day.value)}
                  disabled={!isEditing}
                  className={`p-3 flex-1 text-center min-w-[80px] rounded-xl border-2 transition-all text-sm ${
                    formData.workdays.includes(day.value)
                      ? "border-primary-500 bg-primary-500/20 text-primary"
                      : isEditing
                      ? "border-white/20 glass-card-hover text-secondary"
                      : "border-transparent bg-black/10 text-muted"
                  } ${isEditing ? "" : "cursor-default"}`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          {/* Save Button Area */}
          {isEditing && (
            <div className="pt-6 border-t border-white/20 flex justify-end gap-4">
              <button type="button" onClick={handleEditingCancel} className="btn-secondary">
                Peruuta
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Tallennetaan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Tallenna muutokset</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- Profiilitiedot (Profile Info) Card --- */}
      <div className="glass-card rounded-2xl w-full max-w-4xl">
        <div className="flex items-center space-x-3 p-6 border-b border-white/20">
          <User2 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">Profiilitiedot</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-secondary leading-relaxed">
            Yleisten käyttäjätietojen, kuten nimen, sähköpostin ja salasanan, muokkaus tapahtuu Keycloak-palvelun
            kautta.
            <br />
            <strong>Huomio:</strong> Muutosten päivittyminen tähän sovellukseen voi kestää hetken (yleensä noin 5
            minuuttia) vanhentuneen istunnon vuoksi.
          </p>
          <a
            href={keycloakAccountUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Siirry Keycloak-profiiliin</span>
            <LinkIcon className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* --- Profiilin Poisto (Profile Deletion) Card --- */}
      <div className="glass-card border-2 border-red-500/30 rounded-2xl w-full max-w-4xl">
        <div className="flex items-center space-x-3 p-6 border-b border-red-500/20 text-red-400">
          <AlertOctagon className="w-6 h-6" />
          <h2 className="text-xl font-bold">Profiilin poisto</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-secondary">
            Voit poistaa käyttäjäprofiilisi ja kaikki siihen liittyvät tiedot pysyvästi. Tätä toimintoa ei voi
            peruuttaa.
          </p>
          <button
            onClick={handleAccountDelete}
            className="px-6 py-3 rounded-xl font-medium transition-all bg-red-500/80 text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:shadow-lg"
          >
            Poista käyttäjäprofiili
          </button>
        </div>
      </div>

      {/* --- Confirmation Modal --- */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmAccountDelete}
        message={
          <>
            Oletko varma, että haluat poistaa käyttäjäprofiilisi? <br />{" "}
            <strong>Tätä toimintoa ei voi peruuttaa!</strong>
          </>
        }
        title="Vahvista profiilin poisto"
        confirmText="Kyllä, poista profiili"
        cancelText="Peruuta"
        variant="danger"
      />
    </div>
  );
}
