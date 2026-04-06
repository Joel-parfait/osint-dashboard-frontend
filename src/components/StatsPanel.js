import React from "react";
import "../styles.css";

export default function StatsPanel({ records }) {
  const total = records.length;

  const addressCounts = records.reduce((acc, r) => {
    const address = (r.address1 || r.placeofbirth || "").trim();
    if (address && address !== "—" && address !== "") {
      acc[address] = (acc[address] || 0) + 1;
    }
    return acc;
  }, {});

  const mostCommon = Object.entries(addressCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="stats-panel-enhanced">
      <div className="stat-card-enhanced stat-blue-enhanced">
        <div className="stat-icon-container">
          <div className="stat-icon">📊</div>
        </div>
        <div className="stat-content-enhanced">
          <h3>Total Records</h3>
          <p className="stat-value-enhanced">{total.toLocaleString()}</p>
        </div>
        <div className="stat-glow"></div>
      </div>
      
      <div className="stat-card-enhanced stat-green-enhanced">
        <div className="stat-icon-container">
          <div className="stat-icon">📍</div>
        </div>
        <div className="stat-content-enhanced">
          <h3>Most Common Address</h3>
          <p className="stat-value-enhanced" style={{ fontSize: mostCommon.length > 15 ? "1.1rem" : "1.5rem" }}>
            {mostCommon}
          </p>
        </div>
        <div className="stat-glow"></div>
      </div>
    </div>
  );
}