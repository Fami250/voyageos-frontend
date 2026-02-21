// ========================================
// VoyageOS API Configuration (PRODUCTION)
// ========================================

const API = "https://voyageos.onrender.com";

// ========================================
// AUTH FETCH WRAPPER
// ========================================

export async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // If token missing → force login
  if (!token) {
    window.location.href = "/login";
    throw new Error("No authentication token found");
  }

  const config = {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  };

  // Auto attach JSON header only if body exists
  if (options.body) {
    config.headers["Content-Type"] = "application/json";

    // If body is object → stringify
    if (typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`${API}${endpoint}`, config);

  // If token expired
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized - Session expired");
  }

  return response;
}

export default API;
