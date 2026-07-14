const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const API_ORIGIN = trimTrailingSlash(import.meta.env.VITE_API_URL || window.location.origin);
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const HAS_PLACEHOLDER_API_URL = /\/\/(my-backend|your-backend)\.onrender\.com$/i.test(API_ORIGIN);
