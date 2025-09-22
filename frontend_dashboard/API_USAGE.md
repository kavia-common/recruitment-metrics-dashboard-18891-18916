# Frontend API Usage Guide

This document describes how the React dashboard communicates with the backend API and how to add new calls safely.

## Configuration

Environment variables (Create React App) are used to configure the API base URL and timeouts.

- REACT_APP_API_BASE_URL: Base URL to the backend API (e.g., http://localhost:8000)
- REACT_APP_API_TIMEOUT_MS: Optional timeout in ms (default 15000)

Copy `.env.example` to `.env` and adjust values. Do not commit `.env`.

## Reusable API Client

The shared client is implemented with Axios at `src/services/apiClient.js`.

- Base URL and timeout are read from `src/config.js`
- Centralized error handling with `normalizeError` ensures consistent UI messages
- Interceptors can inject auth headers in the future
- Example endpoints implemented:
  - getHealth() -> GET /api/health
  - getCandidates(params) -> GET /api/candidates

Usage in components:

```javascript
import { getCandidates, getHealth } from '../services/apiClient';

async function load() {
  try {
    const health = await getHealth();
    const list = await getCandidates({ page: 1 });
    // Use results...
  } catch (err) {
    // err has shape: { message, status, details, type }
  }
}
```

## Adding New Endpoints

1. Implement a new function in `src/services/apiClient.js`:
   - Name it clearly (e.g., createCandidate, updateInterview)
   - Use axios instance `api` to call the endpoint
   - Return `res.data`
   - Let errors bubble up (they will already be normalized by interceptors)

2. Import and use the function in your React component or a hook.

3. Prefer passing query parameters via `params` for GET requests and JSON in the body for POST/PUT.

## CORS Notes

For the browser to call the backend across different origins, the backend must enable CORS. Ensure the backend responds with headers like:

- Access-Control-Allow-Origin: http://localhost:3000
- Access-Control-Allow-Credentials: true (if cookies/session required)
- Access-Control-Allow-Headers: Content-Type, Authorization
- Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS

If you enable `withCredentials: true` in the Axios client, make sure the backend includes proper cookie and CORS configurations.

## Error Handling

Errors returned from the client are normalized to:

```json
{
  "message": "Human-readable message",
  "status": <http status or 0>,
  "details": <raw server payload or string>,
  "type": "http|network|timeout"
}
```

Always show a user-friendly message, and optionally log `details` for debugging.

## Testing the Connection

- Start frontend: `npm start`
- Ensure `REACT_APP_API_BASE_URL` points to your backend
- Open the app; it will perform a health check automatically
- Click "Load Candidates" to test `/api/candidates`

## Security

- Do not hardcode secrets or tokens
- Use env variables and inject tokens via interceptors when auth is implemented
