// API Client using Fetch API
const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("jobtrack_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    register: (userData) =>
      request("/auth/register", { method: "POST", body: userData }),
    login: (credentials) =>
      request("/auth/login", { method: "POST", body: credentials }),
    adminLogin: (credentials) =>
      request("/auth/admin-login", { method: "POST", body: credentials }),
    getMe: () => request("/auth/me", { method: "GET" }),
    logout: () => request("/auth/logout", { method: "POST" }),
  },

  // User Profile
  user: {
    getProfile: () => request("/users/profile", { method: "GET" }),
    updateProfile: (profileData) =>
      request("/users/profile", { method: "PUT", body: profileData }),
  },

  // Job Applications
  applications: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append("search", params.search);
      if (params.status && params.status !== "All") query.append("status", params.status);
      const qs = query.toString() ? `?${query.toString()}` : "";
      return request(`/applications${qs}`, { method: "GET" });
    },
    getById: (id) => request(`/applications/${id}`, { method: "GET" }),
    create: (appData) =>
      request("/applications", { method: "POST", body: appData }),
    update: (id, appData) =>
      request(`/applications/${id}`, { method: "PUT", body: appData }),
    delete: (id) =>
      request(`/applications/${id}`, { method: "DELETE" }),
    getDashboardStats: () =>
      request("/applications/dashboard-stats", { method: "GET" }),
    getInterviews: () =>
      request("/applications/interviews", { method: "GET" }),
    getStatistics: () =>
      request("/applications/statistics", { method: "GET" }),
  },

  // Admin Management
  admin: {
    getStats: () => request("/admin/stats", { method: "GET" }),
    getUsers: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.append("search", params.search);
      const qs = query.toString() ? `?${query.toString()}` : "";
      return request(`/admin/users${qs}`, { method: "GET" });
    },
    getUserDetails: (id) =>
      request(`/admin/users/${id}`, { method: "GET" }),
    updateUserStatus: (id, status) =>
      request(`/admin/users/${id}/status`, {
        method: "PATCH",
        body: { status },
      }),
    deleteUser: (id) =>
      request(`/admin/users/${id}`, { method: "DELETE" }),
  },
};

export default api;
