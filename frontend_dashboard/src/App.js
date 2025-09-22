import React, { useState, useEffect } from 'react';
import './App.css';

import { CandidateService } from './services/candidates';
import { ClientService } from './services/clients';
import { InterviewService } from './services/interviews';
import { MetricsService } from './services/metrics';
import { NotificationsService } from './services/notifications';
import KpiSummary from './components/KpiSummary';
import SimpleList from './components/SimpleList';
import ExcelUpload from './components/ExcelUpload';
import config from './config';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  const [candidates, setCandidates] = useState([]);
  const [clients, setClients] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial data load
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setErrorMsg('');

        const [cand, cli, intr, summ, notes] = await Promise.all([
          CandidateService.list().catch(() => []),
          ClientService.list().catch(() => []),
          InterviewService.list().catch(() => []),
          MetricsService.summary().catch(() => ({})),
          NotificationsService.list().catch(() => []),
        ]);

        if (!mounted) return;

        setCandidates(Array.isArray(cand) ? cand : []);
        setClients(Array.isArray(cli) ? cli : []);
        setInterviews(Array.isArray(intr) ? intr : []);
        setSummary(summ || {});
        setNotifications(Array.isArray(notes) ? notes : []);
      } catch (err) {
        if (!mounted) return;
        setErrorMsg(err?.message || 'Failed to load data from backend.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [cand, cli, intr, summ, notes] = await Promise.all([
        CandidateService.list().catch(() => []),
        ClientService.list().catch(() => []),
        InterviewService.list().catch(() => []),
        MetricsService.summary().catch(() => ({})),
        NotificationsService.list().catch(() => []),
      ]);
      setCandidates(Array.isArray(cand) ? cand : []);
      setClients(Array.isArray(cli) ? cli : []);
      setInterviews(Array.isArray(intr) ? intr : []);
      setSummary(summ || {});
      setNotifications(Array.isArray(notes) ? notes : []);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to refresh data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <h1 style={{ marginTop: 60, marginBottom: 8 }}>Recruitment Metrics Dashboard</h1>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
          Backend: <code>{config.backendUrl}</code>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
          <button className="theme-toggle" onClick={handleRefresh} style={{ position: 'relative', top: 'unset', right: 'unset' }}>
            Refresh Data
          </button>
        </div>

        {errorMsg && <div style={{ color: 'tomato', marginBottom: 12 }}>{errorMsg}</div>}
        {loading && <div style={{ marginBottom: 12 }}>Loading...</div>}

        <KpiSummary summary={summary} />

        <ExcelUpload onUploaded={handleRefresh} />

        <SimpleList title="Notifications" items={notifications} />
        <SimpleList title="Candidates" items={candidates} />
        <SimpleList title="Interviews" items={interviews} />
        <SimpleList title="Clients" items={clients} />
      </header>
    </div>
  );
}

export default App;
