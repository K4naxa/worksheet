"use client";
import { deleteWorkdayAction, saveWorkdayAction } from "@/app/actions";
import { ConfirmationModal, WorkDayModal, WorkDaysList } from "@/components";
import { User, Workday } from "@/types";
import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatDateFinLong } from "@/utils/formatUtils";

export function WorkdayListPageClient({
  initialWorkdays,
  initialProfile,
}: {
  initialWorkdays: Workday[];
  initialProfile: User | null;
}) {
  const router = useRouter();
  // --------------------------------------------------------------------------
  // Props & Derived State
  // --------------------------------------------------------------------------

  // We use props directly for server data to ensure they are always up-to-date after a `router.refresh()`.
  const workdays = initialWorkdays || [];

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** State to manage the `WorkDayModal`'s visibility and data. */
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    selectedDate: string;
    existingWorkday?: Workday;
    defaultWorkdayLength: number;
    isEditing?: boolean;
  }>({
    isOpen: false,
    selectedDate: "",
    existingWorkday: undefined,
    defaultWorkdayLength: initialProfile?.defaultWorkdayLength || 8,
    isEditing: false,
  });

  /** State for the delete confirmation modal. */
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  /** State to track which date is pending deletion. */
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);

  /** Dedicated loading state for the deletion process to provide feedback on the confirmation button. */
  const [isDeleting, setIsDeleting] = useState(false);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

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
  const openModal = useCallback((date: string, workday?: Workday, isEditing?: boolean) => {
    setModalData({
      isOpen: true,
      selectedDate: date,
      defaultWorkdayLength: modalData.defaultWorkdayLength,
      existingWorkday: workday,
      isEditing: isEditing || false, // Default to false if not provided
    });
  }, []);

  /** Closes the WorkDayModal and resets its data. */
  const closeModal = useCallback(() => {
    setModalData({
      isOpen: false,
      selectedDate: "",
      existingWorkday: undefined,
      isEditing: false,
      defaultWorkdayLength: modalData.defaultWorkdayLength,
    });
  }, []);

  // --------------------------------------------------------------------------
  // Data & Interaction Handlers
  // --------------------------------------------------------------------------

  /**
   * Handles the "Edit" action from the `WorkDaysList`, opening the modal with the
   * specified workday's data.
   * @param {Workday} workday - The workday object to be edited.
   */
  const handleEditWorkday = (workday: Workday) => {
    const formattedDate = formatDate(workday.date);
    openModal(formattedDate, workday, true);
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

  return (
    <div className="container mx-auto">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <WorkDaysList workDays={workdays} onEdit={handleEditWorkday} onDelete={handleDeleteRequest} />
        </div>
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
              {dateToDelete ? formatDateFinLong(dateToDelete) : ""}
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
  );
}
