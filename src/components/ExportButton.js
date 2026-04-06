import React from "react";
import "./ExportButton.css";

export default function ExportButton({ results }) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="export-btn-enhanced">
      <span className="btn-icon">📤</span>
      Export as JSON
    </button>
  );
}