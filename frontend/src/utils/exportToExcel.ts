// src/utils/exportToExcel.ts

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { User, Workday } from "@/types";

// Helper to get the school year (e.g., "2024-2025")
const getSchoolYear = (): string => {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();
  if (currentMonth >= 7) return `${currentYear}-${currentYear + 1}`;
  return `${currentYear - 1}-${currentYear}`;
};

// Helper to get the weekday name in Finnish
const getFinnishWeekday = (date: Date): string => {
  return date.toLocaleDateString("fi-FI", { weekday: "long" });
};

export const exportToExcel = async (user: User, workdays: Workday[]) => {
  if (!user || workdays.length === 0) {
    console.error("User data or workdays are missing for export.");
    alert("Ei vientitietoja saatavilla.");
    return;
  }

  // --- 1. Workbook and Styles Setup ---
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Työharjoittelupäiväkirja", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  const purpleColor = "FF8B5CF6"; // A key color from your theme
  const darkTextColor = "FF1E1B4B"; // A dark text color for contrast
  const lightTextColor = "FFFFFFFF";
  const borderColor = "FFD1D5DB";

  // --- 2. Column Widths ---
  worksheet.columns = [
    { key: "date", width: 15 },
    { key: "weekday", width: 15 },
    { key: "hours", width: 10 },
    { key: "activities", width: 45 },
    { key: "learnings", width: 45 },
    { key: "mealLocation", width: 20 },
  ];

  // --- 3. Header Information ---
  worksheet.mergeCells("A1:F1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "Työharjoittelupäiväkirja";
  titleCell.font = {
    name: "Calibri",
    size: 20,
    bold: true,
    color: { argb: darkTextColor },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 40;

  worksheet.addRow([]); // Blank row for spacing

  // Add user details
  const details = [
    ["Oppilas:", user.name],
    ["Työpaikka:", user.company],
    ["Työpaikkaohjaaja:", user.instructor], // <-- Added instructor
    ["Oppilaitos:", "Tampereen seudun ammattiopisto Tredu"],
    ["Lukuvuosi:", getSchoolYear()],
  ];

  details.forEach((detail) => {
    const row = worksheet.addRow(detail);
    worksheet.getCell(`A${row.number}`).font = {
      bold: true,
      color: { argb: darkTextColor },
    };
    worksheet.getCell(`B${row.number}`).font = {
      color: { argb: darkTextColor },
    };
  });

  worksheet.addRow([]); // Blank row for spacing

  // --- 4. Table Headers ---
  const headerRow = worksheet.addRow([
    "Päivämäärä",
    "Viikonpäivä",
    "Tunnit",
    "Työtehtävät",
    "Osaamisen kehittyminen",
    "Ruokailupaikka",
  ]);
  headerRow.height = 25;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: purpleColor },
    };
    cell.font = { color: { argb: lightTextColor }, bold: true, size: 12 };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: borderColor } },
      left: { style: "thin", color: { argb: borderColor } },
      bottom: { style: "thin", color: { argb: borderColor } },
      right: { style: "thin", color: { argb: borderColor } },
    };
  });

  // --- 5. Data Rows ---
  const sortedWorkdays = [...workdays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedWorkdays.forEach((day) => {
    const date = new Date(day.date);
    const rowData = {
      date: date.toLocaleDateString("fi-FI"),
      weekday: getFinnishWeekday(date),
      hours: day.hours,
      activities: day.activities,
      learnings: day.learnings,
      mealLocation:
        day.mealLocation === "other" ? day.mealLocationOther : day.mealLocation,
    };
    const row = worksheet.addRow(rowData);

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      cell.font = { color: { argb: darkTextColor }, name: "Calibri", size: 11 };
      cell.border = {
        top: { style: "thin", color: { argb: borderColor } },
        left: { style: "thin", color: { argb: borderColor } },
        bottom: { style: "thin", color: { argb: borderColor } },
        right: { style: "thin", color: { argb: borderColor } },
      };
    });
  });

  // --- 6. Signature Section (NEW) ---
  worksheet.addRows([[], [], []]); // Add some blank rows for spacing before signatures

  const signatureRow = worksheet.addRow([]); // This row will contain the signature lines
  const signatureRowNumber = signatureRow.number;

  // Student Signature
  worksheet.mergeCells(`A${signatureRowNumber}:B${signatureRowNumber}`);
  const studentCell = worksheet.getCell(`A${signatureRowNumber}`);
  studentCell.value = "Oppilaan allekirjoitus";
  studentCell.alignment = { horizontal: "center" };
  studentCell.border = {
    top: { style: "thin", color: { argb: darkTextColor } },
  };

  // Instructor Signature
  worksheet.mergeCells(`E${signatureRowNumber}:F${signatureRowNumber}`);
  const instructorCell = worksheet.getCell(`E${signatureRowNumber}`);
  instructorCell.value = "Työpaikkaohjaajan allekirjoitus";
  instructorCell.alignment = { horizontal: "center" };
  instructorCell.border = {
    top: { style: "thin", color: { argb: darkTextColor } },
  };

  // --- 7. Generate and Download ---
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName = `Tyopäiväkirja_${user.name?.replace(
      /\s+/g,
      "_"
    )}_${new Date().toLocaleDateString("fi-FI")}.xlsx`;
    saveAs(blob, fileName);
  });
};
