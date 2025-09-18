# Recruitment Metrics Frontend Dashboard

Modern React dashboard implementing the "Ocean Professional" theme. It connects to the backend API to manage candidates, interviews, clients, show KPIs/charts, notifications, and supports Excel upload.

## Quick start

1. Configure backend API base URL
   - Copy `.env.example` to `.env` and set:
     ```
     REACT_APP_API_BASE_URL=http://localhost:5000
     ```
2. Install and run
   ```
   npm install
   npm start
   ```

## Features

- KPI cards: Candidates, Interviews, Clients, Conversion Rate
- Tabs: Candidates, Interviews, Clients
- Filters: search, status, date range
- Data tables with inline Edit/Delete
- Charts area (data-driven placeholder)
- Notifications (mark as read)
- Excel upload (xlsx/csv)

## API expectations

The UI calls these endpoints:
- GET `/api/metrics/kpis`, `/api/metrics/charts`
- GET `/api/notifications`, POST `/api/notifications/:id/read`
- GET/POST/PUT/DELETE `/api/candidates`, `/api/candidates/:id`
- GET/POST/PUT/DELETE `/api/interviews`, `/api/interviews/:id`
- GET/POST/PUT/DELETE `/api/clients`, `/api/clients/:id`
- POST `/api/upload/excel` (multipart form-data with "file")

Response shapes:
- List endpoints may return `{ items: [...] }` or `[...]` (both supported)
- KPI sample:
  ```
  { "candidates": 120, "interviews": 30, "clients": 12, "conversion_rate": "22%" }
  ```

## Theme

- Blue & amber accents
- Subtle shadows, rounded corners, smooth transitions
- Supports light/dark mode toggle

## Notes

- If API routes differ, update `src/api.js` Endpoints.
- For charts, the container shows a placeholder; bind data from `/api/metrics/charts` as available.
