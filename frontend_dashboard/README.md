# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Integrated Backend API

The app now integrates with a backend API and fetches:
- Candidates: GET /candidates
- Clients: GET /clients
- Interviews: GET /interviews
- KPI Summary: GET /metrics/summary
- Notifications: GET /metrics/notifications
- Excel Upload: POST /uploads/excel

Configure the backend base URL via environment variable:
- REACT_APP_BACKEND_URL (default: http://localhost:5000)

See `.env.example` for details.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Getting Started

Copy `.env.example` to `.env` and set REACT_APP_BACKEND_URL if necessary.

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

The main theme colors are defined as CSS variables in `src/App.css`.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
