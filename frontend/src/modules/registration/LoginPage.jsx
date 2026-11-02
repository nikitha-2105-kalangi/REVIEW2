import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      await login(formData.email, formData.password);
      setMessage({ text: "Login successful! Redirecting...", type: "success" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      setMessage({
        text: err.message || "Incorrect email or password. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-layout">
        {/* Left Side: Login Image */}
        <section className="auth-visual">
          <img
            src="/assets/loginpage.jpeg"
            alt="JobTrack login illustration"
            className="auth-illustration"
          />
        </section>

        {/* Right Side: Login Form */}
        <section className="auth-form-section">
          <form className="auth-card" onSubmit={handleSubmit}>
            <h1>Login to JobTrack</h1>
            <p className="auth-description">
              Log in to access your JobTrack dashboard.
            </p>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
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

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>

            <div style={{ marginTop: "14px", textAlign: "center" }}>
              <Link to="/admin-login" style={{ fontSize: "13px", color: "#6d4bd1", textDecoration: "none", fontWeight: 500 }}>
                🛡️ Looking for Admin Login?
              </Link>
            </div>

            <Link to="/" className="back-link">
              ← Back to Home
            </Link>
          </form>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
