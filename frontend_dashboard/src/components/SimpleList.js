import React from 'react';

// PUBLIC_INTERFACE
/**
 * Renders a simple list of items.
 * If item is an object, renders JSON string; otherwise renders item.toString().
 */
export default function SimpleList({ title, items }) {
  return (
    <div style={{ textAlign: 'left', width: '100%', maxWidth: 1000, margin: '16px auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {(!items || items.length === 0) && <div style={{ opacity: 0.6 }}>No data</div>}
      <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
        {items && items.map((item, idx) => (
          <li key={idx}>
            {typeof item === 'object' ? <code style={{ fontSize: 12 }}>{JSON.stringify(item)}</code> : String(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
