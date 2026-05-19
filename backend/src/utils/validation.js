export const normalizeText = (value = "") => String(value || "").trim();

export const normalizeEmail = (value = "") => normalizeText(value).toLowerCase();

export const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(normalizeText(value));

export const isTenDigitPhone = (value) => /^\d{10}$/.test(normalizeText(value));

export const isSixDigitPincode = (value) => /^\d{6}$/.test(normalizeText(value));

export const isPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const validateOptionalPhone = (value, label) => {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  return isTenDigitPhone(normalized) ? "" : `${label} must be exactly 10 digits`;
};

export const validateOptionalPincode = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  return isSixDigitPincode(normalized) ? "" : "Pincode must be exactly 6 digits";
};
