import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock API module and fetch behavior
jest.mock('./api', () => {
  const actual = jest.requireActual('./api');
  return {
    ...actual,
    API_BASE_URL: 'http://localhost:5000',
    Endpoints: actual.Endpoints,
    apiRequest: jest.fn(),
    getJSON: jest.fn(),
    postJSON: jest.fn(),
    putJSON: jest.fn(),
    deleteJSON: jest.fn(),
    uploadFile: jest.fn(),
  };
});

import { getJSON, postJSON, uploadFile } from './api';

// Helper to render the app
function renderApp() {
  return render(<App />);
}

describe('Dashboard behaviors', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // default mocks for initial load
    // KPIs request
    getJSON.mockImplementation((path) => {
      if (path.startsWith('/api/metrics/kpis')) {
        return Promise.resolve({
          candidates: 12,
          interviews: 5,
          clients: 3,
          conversion_rate: '42%',
        });
      }
      if (path.startsWith('/api/metrics/charts')) {
        return Promise.resolve({ series: [] });
      }
      if (path.startsWith('/api/notifications')) {
        return Promise.resolve({ items: [] });
      }
      if (path.startsWith('/api/candidates')) {
        return Promise.resolve({ items: [
          { id: 1, name: 'Alice', email: 'alice@example.com', status: 'open', source: 'LinkedIn' },
        ]});
      }
      if (path.startsWith('/api/interviews')) {
        return Promise.resolve({ items: [
          { id: 2, candidate_name: 'Bob', client_name: 'Acme', stage: 'Phone', date: new Date().toISOString() },
        ]});
      }
      if (path.startsWith('/api/clients')) {
        return Promise.resolve({ items: [
          { id: 3, name: 'Globex', open_roles: 7, sla_days: 5 },
        ]});
      }
      return Promise.resolve({});
    });

    postJSON.mockImplementation((path, data) => {
      if (path.startsWith('/api/notifications/') && path.endsWith('/read')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, data });
    });

    uploadFile.mockResolvedValue({ ok: true });
  });

  test('renders KPIs with values from API', async () => {
    renderApp();

    // Header
    expect(screen.getByText(/Recruitment Dashboard/i)).toBeInTheDocument();

    // KPI titles visible
    expect(screen.getByText('Candidates')).toBeInTheDocument();
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();

    // KPI values from mocked getJSON
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('42%')).toBeInTheDocument();
    });
  });

  test('file upload UI appears and triggers upload flow', async () => {
    const user = userEvent.setup();
    renderApp();

    // There should be a label that opens file input
    const chooseExcel = screen.getByRole('button', { name: /choose excel/i });
    expect(chooseExcel).toBeInTheDocument();

    // Locate the hidden file input by label association
    const fileInput = screen.getByLabelText(/choose excel/i, { selector: 'input[type="file"]' });
    // Create a fake file
    const file = new File(['name,email\njohn,john@example.com'], 'candidates.csv', { type: 'text/csv' });

    // Upload the file: since the input is hidden, we can fire upload directly
    await user.upload(fileInput, file);

    // After choosing a file, Upload button should be enabled
    const uploadBtn = screen.getByRole('button', { name: /upload/i });
    expect(uploadBtn).toBeEnabled();

    // Click upload triggers uploadFile call
    await user.click(uploadBtn);

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledTimes(1);
    });
    const [pathArg, formDataArg] = uploadFile.mock.calls[0];
    expect(pathArg).toBe('/api/upload/excel');
    // ensure FormData has file field
    expect(formDataArg instanceof FormData).toBe(true);

    // After success, we expect KPIs refresh call
    await waitFor(() => {
      // getJSON called for kpis and charts at least once initially + refresh after upload
      expect(getJSON).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/metrics\/kpis/));
    });
  });

  test('switching tabs updates visible panel content', async () => {
    const user = userEvent.setup();
    renderApp();

    // initial candidates table content visible
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Click Interviews tab
    await user.click(screen.getByRole('tab', { name: /interviews/i }));
    // Should render interview row
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument(); // candidate_name
      expect(screen.getByText('Acme')).toBeInTheDocument();
    });

    // Click Clients tab
    await user.click(screen.getByRole('tab', { name: /clients/i }));
    await waitFor(() => {
      expect(screen.getByText('Globex')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument(); // open_roles
    });

    // Back to Candidates
    await user.click(screen.getByRole('tab', { name: /candidates/i }));
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });
});
