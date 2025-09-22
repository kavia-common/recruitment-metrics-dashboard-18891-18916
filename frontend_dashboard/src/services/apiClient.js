/**
 * Reusable API client for the dashboard.
 * - Reads base URL from config (env-driven)
 * - Adds request/response interceptors
 * - Normalizes errors for UI consumption
 * - Provides example calls for /api/health and /api/candidates
 *
 * Note: Ensure the backend enables CORS. For local dev:
 *   Access-Control-Allow-Origin: http://localhost:3000
 *   Access-Control-Allow-Credentials: true
 *   Access-Control-Allow-Headers: Content-Type, Authorization
 *   Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
 */

import axios from "axios";
import { getConfig } from "../config";

const { apiBaseUrl, timeoutMs } = getConfig();

// Validate configuration early to surface misconfiguration in development.
if (!apiBaseUrl) {
  // Non-fatal: we still export a client that will error at call time with clear messaging.
  // eslint-disable-next-line no-console
  console.warn(
    "[apiClient] REACT_APP_API_BASE_URL is not set. API calls will fail until configured."
  );
}

/**
 * Create axios instance.
 * You can extend headers here (e.g., Authorization) when auth is implemented.
 */
const api = axios.create({
  baseURL: apiBaseUrl || "/", // fallback to root to avoid axios errors, but calls will likely 404 if not set
  timeout: timeoutMs,
  withCredentials: false, // set to true when backend supports cookies across origins
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor – add per-request logic here (e.g., auth tokens)
api.interceptors.request.use(
  (config) => {
    // Example: attach a bearer token when auth is added in future:
    // const token = localStorage.getItem("access_token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(normalizeError(error))
);

// Response interceptor – centralize error handling/logging
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error))
);

/**
 * Utility to convert axios/network errors to a consistent format for UI.
 */
function normalizeError(error) {
  // Network error or timeout
  if (error.code === "ECONNABORTED") {
    return {
      message: "The request timed out. Please try again.",
      status: 0,
      details: error.message,
      type: "timeout",
    };
  }
  if (error.message === "Network Error" || error.isAxiosError && !error.response) {
    return {
      message:
        "Unable to reach the server. Check your connection or verify the API is running.",
      status: 0,
      details: error.message,
      type: "network",
    };
  }

  // HTTP error with response
  const status = error?.response?.status || 0;
  const data = error?.response?.data;
  const serverMessage =
    (data && (data.message || data.error || data.detail)) || error.message;

  return {
    message: serverMessage || "Request failed.",
    status,
    details: data || error.toString(),
    type: "http",
  };
}

// PUBLIC_INTERFACE
export async function getHealth() {
  /** Fetches backend health status from /api/health */
  const res = await api.get("/api/health");
  return res.data;
}

// PUBLIC_INTERFACE
export async function getCandidates(params = {}) {
  /**
   * Fetches a list of candidates from /api/candidates
   * Params can include filters like page, search, status, etc.
   */
  const res = await api.get("/api/candidates", { params });
  return res.data;
}

export default api;
