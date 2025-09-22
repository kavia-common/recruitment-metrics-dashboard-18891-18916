import React from 'react';

// PUBLIC_INTERFACE
/**
 * Displays KPI summary as simple stat tiles.
 * Expects an object of key -> value pairs.
 */
export default function KpiSummary({ summary }) {
  if (!summary) return null;
  const entries = Object.entries(summary);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, width: '100%', maxWidth: 1000, margin: '16px auto' }}>
      {entries.map(([k, v]) => (
        <div key={k} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{k}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{String(v)}</div>
        </div>
      ))}
    </div>
  );
}
