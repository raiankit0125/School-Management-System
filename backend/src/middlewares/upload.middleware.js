import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
});

export const chatUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});
