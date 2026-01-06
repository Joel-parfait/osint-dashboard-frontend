import React from "react";
import "./ExportButton.css";

export default function ExportButton({ results }) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="export-btn">📤 Export as JSON</button>
  );
}
