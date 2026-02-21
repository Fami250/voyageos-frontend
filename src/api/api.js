// =======================================
// VOYAGEOS CENTRAL API CONFIG (AUTH SAFE)
// =======================================

const API =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// 🔐 Authenticated Fetch Wrapper
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  return response;
};

export default API;
