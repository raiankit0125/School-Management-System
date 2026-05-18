export const digitsOnly = (value, maxLength = 10) =>
  String(value || "").replace(/\D/g, "").slice(0, maxLength);

export const isEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || "").trim());

export const isTenDigitPhone = (value) => /^\d{10}$/.test(String(value || "").trim());

export const isSixDigitPincode = (value) => /^\d{6}$/.test(String(value || "").trim());

export const isPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

export const validatePhone = (value, label) => {
  if (!value) return "";
  return isTenDigitPhone(value) ? "" : `${label} must be exactly 10 digits`;
};

export const validatePincode = (value) => {
  if (!value) return "";
  return isSixDigitPincode(value) ? "" : "Pincode must be exactly 6 digits";
};
