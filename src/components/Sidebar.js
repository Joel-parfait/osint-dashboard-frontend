import React from "react";
import "../styles.css";

export default function Sidebar({ active, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="logo">🕵️ OSINT</div>

      <nav>
        <ul>
          <li
            className={active === "dashboard" ? "active" : ""}
            onClick={() => onNavigate("dashboard")}
          >
            📊 Dashboard
          </li>

          <li
            className={active === "sources" ? "active" : ""}
            onClick={() => onNavigate("sources")}
          >
            📁 Sources
          </li>

          <li
            className={active === "reports" ? "active" : ""}
            onClick={() => onNavigate("reports")}
          >
            📄 Reports
          </li>

          <li
            className={active === "settings" ? "active" : ""}
            onClick={() => onNavigate("settings")}
          >
            ⚙️ Settings
          </li>
        </ul>
      </nav>

      {/* LOGOUT BUTTON */}
      <button className="sidebar-logout" onClick={onLogout}>
        🚪 Logout
      </button>
    </aside>
  );
}
