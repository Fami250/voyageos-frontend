// =======================================================
// VOYAGEOS API CONFIG - PRODUCTION SAFE (FINAL LOCKED)
// =======================================================

// IMPORTANT:
// Always use environment variable in production.
// Fallback is set to live backend (NOT localhost).

const API =
  import.meta.env.VITE_API_URL ||
  "https://voyageos.onrender.com";

// Export base API URL
export default API;
