"use client";
import { updateUserProfileAction } from "@/app/actions";
import { Briefcase, Calendar, LogOut, Save, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

export default function RegisterPageClient({
  userProfile,
}: {
  userProfile: User;
}) {
  const router = useRouter();
  const { update } = useSession();

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
    setFormData((prev) => ({
      ...prev,
      workdays: prev.workdays.includes(dayValue)
        ? prev.workdays.filter((d) => d !== dayValue)
        : [...prev.workdays, dayValue].sort(),
    }));
  };

  interface FormData {
    company: string;
    instructor: string;
    startDate: string;
    endDate: string;
    workdays: number[];
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    company: "",
    instructor: "",
    startDate: "",
    endDate: "",
    workdays: [1, 2, 3, 4, 5],
  });

  const validateAndSubmit = async () => {
    const { company, instructor, startDate, endDate, workdays } = formData;

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
    setLoading(true);
    setError(null);

    try {
      await updateUserProfileAction(formData);

      // If registration is successful, update session state
      // This will trigger a re-render and update the session context
      await update();

      // Redirect to home page after successful registration
      console.log(
        "✅Registration completed successfully, redirecting to home!"
      );
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Error submitting form:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Virhe rekisteröinnissä. Tarkista syötteet ja yritä uudelleen."
        );
      }
    } finally {
      setLoading(false);
    }
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
    <div
      className="min-h-screen"
      style={{ background: "var(--gradient-background)" }}
    >
      <div className="container mx-auto px-4 py-8 text-primary-50">
        {/* Header */}

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center sm:p-4 z-50">
          <div className="glass-card w-screen h-screen sm:rounded-2xl sm:max-w-lg sm:max-h-fit overflow-hidden ">
            <div className="flex items-center justify-between p-6 border-b border-white/20 relative">
              <div className="text-primary w-full ">
                {/* Logout Button */}
                <LogOut
                  className="w-5 h-5 text-muted absolute left-2 cursor-pointer hover:text-primary"
                  onClick={() => signOut()}
                />

                <div className="text-xl font-bold text-center text-primary w-auto mx-4">
                  Rekisteröi työharjoittelu
                </div>
              </div>
            </div>

            {/* Error message */}

            {error && (
              <div className="bg-red-500/20 text-red-500 p-2 rounded-b-lg">
                {error}
              </div>
            )}

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* company Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-muted" />
                  <label className="text-primary font-medium">
                    Yrityksen Nimi:
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Työn tarjoavan yrityksen nimi"
                  className="input-field"
                  required
                />
              </div>

              {/* Instructor Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User2 className="w-5 h-5 text-muted" />
                  <label className="text-primary font-medium">
                    Työn ohjaajan nimi:
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  placeholder="Sinua ohjaavan henkilön nimi"
                  className="input-field"
                  required
                />
              </div>

              {/* Start date */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-muted" />
                  <label className="text-primary font-medium">
                    Aloitus päivä
                  </label>
                </div>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  max={formData.endDate ? formData.endDate : undefined} // Ensure start date is before end date
                  className="input-field"
                  required
                />
              </div>

              {/* End date */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-muted" />
                  <label className="text-primary font-medium">
                    Viimeinen työpäivä päivä
                  </label>
                </div>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  min={formData.startDate} // Ensure end date is after start date
                  className="input-field"
                  required
                />
              </div>

              {/* Workdays Section */}
              <div className="space-y-3">
                <label className="text-primary font-medium">
                  Työpäivät viikossa
                </label>
                <div className="flex gap-2 flex-wrap w-full">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleWorkDayToggle(day.value)}
                      className={`p-3 min-w-14 rounded-xl border-2 transition-all text-sm ${
                        formData.workdays.includes(day.value)
                          ? "border-primary-500 bg-primary-500/20 text-primary"
                          : "border-white/20 bg-white/10 w-auto text-secondary glass-card-hover"
                      }`}
                    >
                      {day.label.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  validateAndSubmit();
                }}
                disabled={
                  !formData.company ||
                  !formData.instructor ||
                  !formData.startDate ||
                  !formData.endDate ||
                  formData.workdays.length === 0 ||
                  loading
                }
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Rekisteröidään...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Rekisteröidy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
