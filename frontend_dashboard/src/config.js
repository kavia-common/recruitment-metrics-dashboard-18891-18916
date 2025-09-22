/**
 * App configuration
 * Reads environment variables (Create React App requires REACT_APP_ prefix).
 * Do not hardcode sensitive info; orchestrator will populate .env.
 */

// PUBLIC_INTERFACE
export const getConfig = () => {
  /** Returns the frontend configuration derived from environment variables. */
  const baseUrl = process.env.REACT_APP_API_BASE_URL || "";
  const timeoutMs = Number(process.env.REACT_APP_API_TIMEOUT_MS || 15000);

  return {
    apiBaseUrl: baseUrl.replace(/\/+$/, ""), // strip trailing slash to avoid double slashes
    timeoutMs,
  };
};
