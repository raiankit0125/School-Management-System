import XLSX from "xlsx";

export const parseExcelBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON rows
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows;
};
