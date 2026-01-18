import { parseCsvBuffer } from "./parseCsv.js";
import { parseExcelBuffer } from "./parseExcel.js";

export const parseUploadedFile = async (file) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  if (ext === "csv") return await parseCsvBuffer(file.buffer);
  if (ext === "xlsx" || ext === "xls") return parseExcelBuffer(file.buffer);

  throw new Error("Only CSV or Excel (.xlsx/.xls) files allowed");
};
