import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { getHealth, getCandidates } from './services/apiClient';
import { getConfig } from './config';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [health, setHealth] = useState({ loading: false, data: null, error: null });
  const [candidates, setCandidates] = useState({ loading: false, data: null, error: null });

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load sample API data on mount
  useEffect(() => {
    const fetchHealth = async () => {
      setHealth({ loading: true, data: null, error: null });
      try {
        const data = await getHealth();
        setHealth({ loading: false, data, error: null });
      } catch (err) {
        setHealth({ loading: false, data: null, error: err });
      }
    };

    fetchHealth();
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLoadCandidates = async () => {
    setCandidates({ loading: true, data: null, error: null });
    try {
      const data = await getCandidates({ page: 1 });
      setCandidates({ loading: false, data, error: null });
    } catch (err) {
      setCandidates({ loading: false, data: null, error: err });
    }
  };

  const { apiBaseUrl } = getConfig();

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

        <img src={logo} className="App-logo" alt="logo" />

        <p>
          Backend Base URL: <code>{apiBaseUrl || '(not configured)'}</code>
        </p>

        <section style={{ marginTop: 16 }}>
          <h3>Health Check</h3>
          {health.loading && <p>Checking backend health…</p>}
          {!health.loading && health.error && (
            <p style={{ color: 'tomato' }}>
              {health.error?.message || 'Health check failed'}
              {health.error?.status ? ` (status: ${health.error.status})` : ''}
            </p>
          )}
          {!health.loading && health.data && (
            <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.05)', padding: 12, borderRadius: 8, maxWidth: 600 }}>
              {JSON.stringify(health.data, null, 2)}
            </pre>
          )}
        </section>

        <section style={{ marginTop: 24 }}>
          <h3>Candidates (Sample)</h3>
          <button className="theme-toggle" style={{ position: 'static' }} onClick={handleLoadCandidates}>
            Load Candidates
          </button>
          {candidates.loading && <p>Loading candidates…</p>}
          {!candidates.loading && candidates.error && (
            <p style={{ color: 'tomato' }}>
              {candidates.error?.message || 'Failed to load candidates'}
              {candidates.error?.status ? ` (status: ${candidates.error.status})` : ''}
            </p>
          )}
          {!candidates.loading && candidates.data && (
            <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.05)', padding: 12, borderRadius: 8, maxWidth: 600 }}>
              {JSON.stringify(candidates.data, null, 2)}
            </pre>
          )}
        </section>

        <p style={{ marginTop: 24 }}>
          Current theme: <strong>{theme}</strong>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
