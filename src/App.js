import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Sources from "./Sources";
import Reports from "./Reports";
import Settings from "./Settings";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import "./styles.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔐 AUTH CHECK - Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const isAuthStored = localStorage.getItem("isAuthenticated");
    
    // Only set authenticated if BOTH token and flag exist
    setIsAuthenticated(!!token && isAuthStored === "true");
  }, []);

  // Dark mode
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab("dashboard");
  };

  // Logout - Clear ALL authentication data
  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");  // ✅ THIS WAS MISSING
    localStorage.removeItem("osint_user"); // Clear any other user data
    
    // Update state
    setIsAuthenticated(false);
    setActiveTab("dashboard"); // Reset to default tab
  };

  // 🔒 BLOCK ACCESS - Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        active={activeTab}
        onNavigate={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="main-panel">
        <div style={{ display: activeTab === "dashboard" ? "block" : "none" }}>
          <Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>

        {activeTab === "sources" && <Sources />}
        {activeTab === "reports" && (
          <Reports onNavigateToDashboard={() => setActiveTab("dashboard")} />
        )}
        {activeTab === "settings" && (
          <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
        )}
      </main>
    </div>
  );
}