/*
// PUBLIC_INTERFACE
Set the API base URL. Prefer environment variable; default to preview backend port 3001.
Update this if your backend runs on a different host/port.
*/
export const API_BASE_URL =
  (() => {
    // Ensure we produce a normalized base URL with no trailing slash
    const env = (process.env.REACT_APP_API_BASE_URL || "").trim();
    const fromEnv = env ? env : null;

    if (fromEnv) {
      try {
        const u = new URL(fromEnv);
        return `${u.protocol}//${u.host}`; // strip paths if any
      } catch {
        // If invalid URL in env, fall back to window-derived
      }
    }

    // Derive backend URL from current location, swapping to port 3001 and preserving protocol/host.
    // Works for preview hosts like https://host:3000 -> https://host:3001
    if (typeof window !== "undefined" && window.location) {
      try {
        const { protocol, hostname } = window.location;
        return `${protocol}//${hostname}:3001`;
      } catch {
        // Fallback if window parsing fails
      }
    }
    return "http://localhost:3001";
  })();

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

  const fullUrl = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
      // credentials can be toggled if backend uses cookies; default omit to avoid CORS complications.
      credentials: options.credentials || "omit",
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json().catch(() => ({})) : await res.text();

    if (!res.ok) {
      const message = (isJson && (payload.message || payload.error)) || res.statusText || "API Error";
      const error = new Error(message);
      error.status = res.status;
      error.payload = payload;
      error.url = fullUrl;
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("API request failed", {
          url: fullUrl,
          status: res.status,
          message,
          payload,
        });
      }
      throw error;
    }

    return payload;
  } catch (err) {
    // Network errors (CORS, DNS, connection refused, timeout abort)
    if (err?.name === "AbortError") {
      const e = new Error(`Request timed out after 30s: ${fullUrl}`);
      e.cause = err;
      throw e;
    }
    if (err instanceof TypeError && /fetch/i.test(err.message)) {
      const hint =
        "Network error during fetch. Check that the backend is running, the REACT_APP_API_BASE_URL is correct, and CORS is enabled on the backend for this origin.";
      const e = new Error(`Failed to fetch ${fullUrl}. ${hint}`);
      e.cause = err;
      throw e;
    }
    // rethrow other errors
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// PUBLIC_INTERFACE
export const Endpoints = {
  candidates: {
    list: (q = "") => `/candidates/${q ? `?${q}` : ""}`,
    create: () => `/candidates/`,
    update: (id) => `/candidates/${id}`,
    remove: (id) => `/candidates/${id}`,
  },
  interviews: {
    list: (q = "") => `/interviews/${q ? `?${q}` : ""}`,
    create: () => `/interviews/`,
    update: (id) => `/interviews/${id}`,
    remove: (id) => `/interviews/${id}`,
  },
  clients: {
    list: (q = "") => `/clients/${q ? `?${q}` : ""}`,
    create: () => `/clients/`,
    update: (id) => `/clients/${id}`,
    remove: (id) => `/clients/${id}`,
    // positions endpoints exist, but not wired here in this UI flow
  },
  metrics: {
    summary: () => `/metrics/summary`,
    notifications: () => `/metrics/notifications`,
  },
  files: {
    uploadExcel: () => `/uploads/excel`,
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
