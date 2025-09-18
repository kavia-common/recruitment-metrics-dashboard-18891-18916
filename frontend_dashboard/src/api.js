//
// PUBLIC_INTERFACE
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

/**
 * PUBLIC_INTERFACE
 * Generic API request helper with JSON handling, timeouts, and error normalization.
 * @param {string} path - API path starting with /
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiRequest(path, options = {}) {
  /** Normalize options and add JSON headers */
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  const headers = {
    "Accept": "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json().catch(() => ({})) : await res.text();

    if (!res.ok) {
      const message = (isJson && (payload.message || payload.error)) || res.statusText || "API Error";
      const error = new Error(message);
      error.status = res.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

// PUBLIC_INTERFACE
export const Endpoints = {
  candidates: {
    list: (q = "") => `/api/candidates${q ? `?${q}` : ""}`,
    create: () => `/api/candidates`,
    update: (id) => `/api/candidates/${id}`,
    remove: (id) => `/api/candidates/${id}`,
  },
  interviews: {
    list: (q = "") => `/api/interviews${q ? `?${q}` : ""}`,
    create: () => `/api/interviews`,
    update: (id) => `/api/interviews/${id}`,
    remove: (id) => `/api/interviews/${id}`,
  },
  clients: {
    list: (q = "") => `/api/clients${q ? `?${q}` : ""}`,
    create: () => `/api/clients`,
    update: (id) => `/api/clients/${id}`,
    remove: (id) => `/api/clients/${id}`,
  },
  metrics: {
    kpis: (q = "") => `/api/metrics/kpis${q ? `?${q}` : ""}`,
    charts: (q = "") => `/api/metrics/charts${q ? `?${q}` : ""}`,
  },
  notifications: {
    list: () => `/api/notifications`,
    markRead: (id) => `/api/notifications/${id}/read`,
  },
  files: {
    uploadExcel: () => `/api/upload/excel`,
  }
};

// PUBLIC_INTERFACE
export async function getJSON(path) {
  return apiRequest(path, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function postJSON(path, data) {
  return apiRequest(path, { method: "POST", body: JSON.stringify(data) });
}

// PUBLIC_INTERFACE
export async function putJSON(path, data) {
  return apiRequest(path, { method: "PUT", body: JSON.stringify(data) });
}

// PUBLIC_INTERFACE
export async function deleteJSON(path) {
  return apiRequest(path, { method: "DELETE" });
}

// PUBLIC_INTERFACE
export async function uploadFile(path, formData) {
  // Do not set Content-Type; browser will set multipart boundary
  return apiRequest(path, { method: "POST", body: formData });
}
