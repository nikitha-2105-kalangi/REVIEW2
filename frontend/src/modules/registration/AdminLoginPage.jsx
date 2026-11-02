import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);

    try {
      await adminLogin(formData.email, formData.password);
      setMessage({ text: "Admin authorization verified! Redirecting...", type: "success" });
      setTimeout(() => {
        navigate("/admin");
      }, 700);
    } catch (err) {
      setMessage({
        text: err.message || "Invalid administrator credentials.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-layout">
        {/* Left Side: Brand Visual */}
        <section className="auth-visual" style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}>
          <img
            src="/assets/sidebar-image.jpeg"
            alt="Admin Control Portal"
            className="auth-illustration"
            style={{ borderRadius: "16px" }}
          />
          <h2 style={{ color: "#ffffff", marginTop: "20px" }}>Admin Control Portal</h2>
          <p style={{ color: "#c7d2fe" }}>
            Secure administration dashboard for monitoring JobTrack user accounts,
            application metrics, and system activity.
          </p>
        </section>

        {/* Right Side: Admin Form */}
        <section className="auth-form-section">
          <form className="auth-card" onSubmit={handleSubmit} style={{ borderTop: "4px solid #7c3aed" }}>
            <div style={{ display: "inline-block", background: "#f3e8ff", color: "#6b21a8", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, marginBottom: "12px" }}>
              SHIELD AUTHORIZATION
            </div>
            <h1>Administrator Login</h1>
            <p className="auth-description">
              Access the JobTrack administrative management portal.
            </p>

            <div className="form-group">
              <label htmlFor="adminEmail">Admin Email</label>
              <input
                type="email"
                id="adminEmail"
                name="email"
                placeholder="admin@jobtrack.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">Admin Password</label>
              <input
                type="password"
                id="adminPassword"
                name="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {message.text && (
              <p className={`form-message ${message.type}`} role="alert">
                {message.text}
              </p>
            )}

            <button
              type="submit"
              className="auth-button"
              style={{ background: "#7c3aed" }}
              disabled={loading}
            >
              {loading ? "Authenticating Admin..." : "Authenticate as Admin 🛡️"}
            </button>

            <div style={{ marginTop: "16px", padding: "12px", background: "#f8fafc", borderRadius: "8px", fontSize: "13px", color: "#64748b" }}>
              <p style={{ margin: 0 }}>
                <strong>Default Seed Admin:</strong><br />
                Email: <code>admin@jobtrack.com</code><br />
                Password: <code>Admin@123456</code>
              </p>
            </div>

            <p className="auth-switch">
              Not an admin? <Link to="/login">User Login</Link>
            </p>

            <Link to="/" className="back-link">
              ← Back to Home
            </Link>
          </form>
        </section>
      </main>
    </div>
  );
}

export default AdminLoginPage;
