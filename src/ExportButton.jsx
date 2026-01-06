import React from 'react';
import './ExportButton.css';

export default function ExportButton({ results }) {
  if (!results.length) return null;

  const handleExport = () => {
    const lines = results.map(r =>
      `${r.name || ''}|${r.nui || ''}|${r.occupation || ''}|${r.phonenumber || ''}|${r.town || ''}`
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'search_results.txt';
    a.click();
  };

  return (
    <div className="export-container">
      <button onClick={handleExport}>📤 Export Results</button>
    </div>
  );
}
