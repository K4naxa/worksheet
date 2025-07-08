// --------------------------------------------------------------------------
// Helper Functions
// --------------------------------------------------------------------------

/**
 * Formats a date string for display in the UI (e.g., in the delete confirmation modal).
 * @param {string | Date} dateStr - The date string to format.
 * @returns {string} A localized, readable date string.
 */
export const formatDateFinLong = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleDateString("fi-FI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a date string to a standard YYYY-MM-DD format.
 * @param {string | Date} dateStr - The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateStr: string | Date) => {
  return new Date(dateStr).toISOString().split("T")[0];
};
