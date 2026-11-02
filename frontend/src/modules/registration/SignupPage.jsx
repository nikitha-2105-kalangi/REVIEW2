import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.fullName.trim().length < 2) {
      setMessage({ text: "Please enter your full name (at least 2 characters).", type: "error" });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.register(formData);
      if (response.success) {
        setMessage({
          text: "Account created successfully! Redirecting to login...",
          type: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    } catch (err) {
      setMessage({
        text: err.message || "Failed to create account. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-layout">
        {/* Left Side: Illustration */}
        <section className="auth-visual">
          <img
            src="/assets/career-track.jpeg"
            alt="Job search illustration"
            className="auth-illustration"
          />
          <h2>Your Dream Job Starts Here</h2>
          <p>
            Organize your applications, prepare for interviews,
            and take the next step in your career.
          </p>
        </section>

        {/* Right Side: Signup Form */}
        <section className="auth-form-section">
          <form className="auth-card" onSubmit={handleSubmit}>
            <h1>Create Your Account</h1>
            <p className="auth-description">
              Join JobTrack and organize your job search.
            </p>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                minLength={2}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={6}
                required
              />
            </div>

            {message.text && (
              <p className={`form-message ${message.type}`} role="alert">
                {message.text}
              </p>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Login</Link>
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

export default SignupPage;
