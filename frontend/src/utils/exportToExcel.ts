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

const mealLocationTranslations: { [key: string]: string } = {
  school: "Koulu",
  work: "Työpaikka",
  // 'other' is handled separately
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

  const purpleColor = "FF8B5CF6"; // A key color from the theme
  const darkTextColor = "FF1E1B4B"; // A dark text color for contrast
  const lightTextColor = "FFFFFFFF";
  const summaryBgColor = "FFE8E5FC"; // A light purple for the summary row
  const borderColor = "FFD1D5DB";

  // --- 2. Column Widths ---
  worksheet.columns = [
    { key: "date", width: 20 },
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
    ["Työpaikkaohjaaja:", user.instructor],
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
  const sortedWorkdays = [...workdays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedWorkdays.forEach((day) => {
    const date = new Date(day.date);

    let mealLocationDisplay = "";
    if (day.isSickday) {
      mealLocationDisplay = "Sairauspäivä";
    } else if (day.mealLocation === "other") {
      mealLocationDisplay = "Muu";
    } else {
      mealLocationDisplay = mealLocationTranslations[day.mealLocation] || day.mealLocation;
    }

    const rowData = {
      date: date.toLocaleDateString("fi-FI"),
      weekday: getFinnishWeekday(date),
      hours: day.isSickday ? "Sairaus" : day.hours,
      activities: day.isSickday ? "Sairauspäivä" : day.activities,
      learnings: day.isSickday ? "Sairauspäivä" : day.learnings,
      mealLocation: mealLocationDisplay,
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

  // --- 6. Summary Table ---

  // A. Calculate the summaries
  const totalDays = workdays.length;
  const sickDays = workdays.filter((day) => day.isSickday).length;
  const workDays = totalDays - sickDays;
  const totalHours = workdays.reduce((sum, day) => sum + (day.isSickday ? 0 : day.hours || 0), 0);
  const mealCounts = workdays
    .filter((day) => !day.isSickday)
    .reduce((counts, day) => {
      const location = day.mealLocation;
      counts[location] = (counts[location] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });

  // B. Add spacing before the summary table
  worksheet.addRows([[], []]);

  // C. Create the Summary Table Header
  const summaryHeaderRow = worksheet.addRow(["Yhteenveto"]);
  const headerCell = summaryHeaderRow.getCell(1);
  worksheet.mergeCells(`A${headerCell.row}:F${headerCell.row}`); // Merge across all columns
  headerCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: purpleColor }, // Use the main header color
  };
  headerCell.font = { color: { argb: lightTextColor }, bold: true, size: 14 };
  headerCell.alignment = { vertical: "middle", horizontal: "center" };
  headerCell.border = {
    top: { style: "thin", color: { argb: borderColor } },
    bottom: { style: "medium", color: { argb: purpleColor } },
  };
  summaryHeaderRow.height = 30;

  // D. Add work statistics subheader
  const workStatsHeaderRow = worksheet.addRow(["Työ tilastot"]);
  const workStatsHeaderCell = workStatsHeaderRow.getCell(1);
  worksheet.mergeCells(`A${workStatsHeaderCell.row}:F${workStatsHeaderCell.row}`);
  workStatsHeaderCell.font = {
    bold: true,
    size: 11,
    color: { argb: darkTextColor },
  };
  workStatsHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
  workStatsHeaderCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: summaryBgColor },
  };
  workStatsHeaderCell.border = {
    top: { style: "thin", color: { argb: borderColor } },
  };

  // E. Add work statistics rows
  const workStatsData = [
    { label: "Päiviä yhteensä", value: `${totalDays} kpl` },
    { label: "Työpäiviä", value: `${workDays} kpl` },
    { label: "Sairauspäiviä", value: `${sickDays} kpl` },
    { label: "Tunteja yhteensä", value: `${totalHours} h` },
  ];

  workStatsData.forEach((item, index) => {
    const row = worksheet.addRow([]);
    const rowNumber = row.number;

    worksheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
    const labelCell = worksheet.getCell(`A${rowNumber}`);
    labelCell.value = item.label;

    worksheet.mergeCells(`C${rowNumber}:F${rowNumber}`);
    const valueCell = worksheet.getCell(`C${rowNumber}`);
    valueCell.value = item.value;

    [labelCell, valueCell].forEach((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: summaryBgColor },
      };
      cell.font = { color: { argb: darkTextColor }, name: "Calibri", size: 11 };
      cell.border = {
        left: { style: "thin", color: { argb: borderColor } },
        right: { style: "thin", color: { argb: borderColor } },
      };
    });

    labelCell.font = { ...labelCell.font, bold: true };
    labelCell.alignment = {
      vertical: "middle",
      horizontal: "right",
      indent: 1,
    };
    valueCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  });

  // F. Add meal subheader
  const mealSubHeaderRow = worksheet.addRow(["Ruokailut"]);
  const mealSubHeaderCell = mealSubHeaderRow.getCell(1);
  worksheet.mergeCells(`A${mealSubHeaderCell.row}:F${mealSubHeaderCell.row}`);
  mealSubHeaderCell.font = {
    bold: true,
    size: 11,
    color: { argb: darkTextColor },
  };
  mealSubHeaderCell.alignment = { vertical: "middle", horizontal: "center" };
  mealSubHeaderCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: summaryBgColor },
  };
  mealSubHeaderCell.border = {
    top: { style: "thin", color: { argb: borderColor } },
  };

  // G. Add meal summary data
  const mealSummaryData = Object.entries(mealCounts).map(([location, count]) => {
    const translatedLabel = mealLocationTranslations[location] || "Muu ruokailu";
    return { label: translatedLabel, value: `${count} kpl` };
  });

  mealSummaryData.forEach((item, index) => {
    const row = worksheet.addRow([]);
    const rowNumber = row.number;

    worksheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
    const labelCell = worksheet.getCell(`A${rowNumber}`);
    labelCell.value = item.label;

    worksheet.mergeCells(`C${rowNumber}:F${rowNumber}`);
    const valueCell = worksheet.getCell(`C${rowNumber}`);
    valueCell.value = item.value;

    [labelCell, valueCell].forEach((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: summaryBgColor },
      };
      cell.font = { color: { argb: darkTextColor }, name: "Calibri", size: 11 };
      cell.border = {
        left: { style: "thin", color: { argb: borderColor } },
        right: { style: "thin", color: { argb: borderColor } },
        ...(index === mealSummaryData.length - 1 && {
          bottom: { style: "thin", color: { argb: borderColor } },
        }),
      };
    });

    labelCell.font = { ...labelCell.font, bold: true };
    labelCell.alignment = {
      vertical: "middle",
      horizontal: "right",
      indent: 1,
    };
    valueCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  });

  // --- 7. Signature Section ---
  worksheet.addRows([[], [], []]);

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
    const fileName = `Tyopäiväkirja_${user.name?.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("fi-FI")}.xlsx`;
    saveAs(blob, fileName);
  });
};
