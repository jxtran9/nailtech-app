import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin-login.css";

const DEMO_PASSWORD = "admin123";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === DEMO_PASSWORD) {
      localStorage.setItem("isAdmin", "true");
      navigate("/admin");
      return;
    }

    setError("Incorrect password.");
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <h1 className="admin-login-title">Admin Login</h1>
        <p className="admin-login-subtitle">
          Demo-only access for the NailTech admin portal.
        </p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label htmlFor="admin-password" className="admin-login-label">
            Password
          </label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter admin password"
            className="admin-login-input"
          />

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-button">
            Log In
          </button>
        </form>
      </section>
    </main>
  );
}
