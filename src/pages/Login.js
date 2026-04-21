// src/pages/Login.js
import { useState, useEffect } from "react";
import "./Login.css"; // Keep your existing CSS
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Clear any stale authentication data when login page loads
  useEffect(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("osint_user"); // Clear this too if you use it
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        localStorage.setItem("auth_token", data.token || "");
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");

        // Notify App.js about successful login
        onLoginSuccess();
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please check if backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-ring"></div>
            <img
              src="/antic-logo.png"
              alt="ANTIC Logo"
              className="antic-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-placeholder" style={{ display: 'none' }}>
              <span>🕵️</span>
            </div>
          </div>

          <h1 className="login-title">ANTIC OSINT Tool</h1>
          <p className="login-subtitle">
            Agence Nationale des Technologies de l'Information et de la Communication
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>🛡️ Sign In</>
            )}
          </button>
        </form>

        <div className="security-notice">
          <span>🔒</span>
          <span>Secure Connection • Encrypted Data</span>
        </div>

        
      </div>

      <footer className="login-footer">
        © {new Date().getFullYear()} ANTIC - All Rights Reserved
      </footer>
    </div>
  );
}