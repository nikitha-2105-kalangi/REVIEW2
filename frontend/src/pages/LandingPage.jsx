import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LandingPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="landing-container">
      <header className="navbar">
        <Link to="/" className="brand">
          <img src="/assets/job track logo.jpeg" alt="JobTrack Logo" />
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", gap: "14px", alignItems: "center" }}>
          {isAuthenticated ? (
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="primary-btn" style={{ padding: "10px 20px" }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: "#5145dc", fontWeight: 600, textDecoration: "none", fontSize: "15px" }}>
                Sign In
              </Link>
              <Link to="/signup" className="primary-btn" style={{ padding: "10px 20px" }}>
                Get Started →
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="hero">
        <section className="hero-content">
          <p className="tagline">YOUR CAREER, ORGANIZED</p>

          <h1>
            Track Your<br />
            <span>Job Journey</span>
          </h1>

          <p className="description">
            Keep your job search simple and organized. Track applications,
            manage interviews, and stay updated on every career opportunity —
            all in one place.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link to="/signup" className="primary-btn">
              Get Started →
            </Link>
            <Link to="/login" style={{ color: "#5145dc", fontWeight: 600, textDecoration: "none" }}>
              Already registered? Login
            </Link>
          </div>

          <p className="note" style={{ marginTop: "24px" }}>
            Your next opportunity starts here.
          </p>

          <div style={{ marginTop: "20px", borderTop: "1px solid #c9d8ee", paddingTop: "14px" }}>
            <Link
              to="/admin-login"
              style={{
                fontSize: "13px",
                color: "#6b7280",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🛡️ Administrator Access Portal
            </Link>
          </div>
        </section>

        <section className="hero-image">
          <img
            src="/assets/Landing-page.jpeg"
            alt="JobTrack job application tracking preview"
          />
        </section>
      </main>

      <footer>
        <p>© 2026 JobTrack. Organize your career journey.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
