// ========================================
// VoyageOS API Configuration (PRODUCTION)
// ========================================

const API = "https://voyageos.onrender.com";

// ========================================
// AUTH FETCH WRAPPER (FINAL STABLE)
// ========================================

export async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // 🔐 If no token → redirect to login
  if (!token) {
    window.location.href = "/login";
    throw new Error("No authentication token found");
  }

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {}),
    },
  };

  // 🧠 Attach body if exists
  if (options.body) {
    config.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  const response = await fetch(`${API}${endpoint}`, config);

  // 🔁 Auto logout on 401
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized - Session expired");
  }

  return response;
}

export default API;
