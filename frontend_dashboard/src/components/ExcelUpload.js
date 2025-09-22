import React, { useState } from 'react';
import { UploadService } from '../services/uploads';

// PUBLIC_INTERFACE
/**
 * Simple Excel upload form that posts file to /uploads/excel.
 */
export default function ExcelUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setStatus('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please choose a file first.');
      return;
    }
    try {
      setStatus('Uploading...');
      const res = await UploadService.excel(file);
      setStatus('Upload successful.');
      if (onUploaded) onUploaded(res);
    } catch (err) {
      setStatus(`Upload failed: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <form onSubmit={handleUpload} style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        aria-label="Upload Excel file"
      />
      <button className="theme-toggle" type="submit" style={{ position: 'relative', top: 'unset', right: 'unset' }}>Upload</button>
      {status && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.8 }}>{status}</span>}
    </form>
  );
}
