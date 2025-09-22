 // PUBLIC_INTERFACE
 /**
  * Returns configuration values for the frontend application.
  * Reads backend API base URL from environment variable: REACT_APP_BACKEND_URL.
  * If not provided, defaults to http://localhost:5000.
  */
const config = {
  // Allow overriding via environment variable at build time
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
};

export default config;
