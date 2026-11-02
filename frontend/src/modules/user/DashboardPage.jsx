import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    appliedPercent: 0,
    interviewPercent: 0,
    offerPercent: 0,
    offerRate: "0%",
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const data = await api.applications.getDashboardStats();
        if (data.success) {
          setStats(data.stats);
          setRecentApplications(data.recentApplications || []);
          setReminders(data.reminders || []);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr + "T00:00:00");
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const displayName = user?.fullName || user?.name || "User";

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div>
            <h2>My Dashboard</h2>
            <p>Track your job search progress.</p>
          </div>

          <div className="header-actions">
            <button
              id="logoutBtn"
              className="logout-btn"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout ↗
            </button>
          </div>
        </header>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* Welcome Banner */}
        <section className="welcome-banner">
          <div>
            <p className="eyebrow">YOUR CAREER, ORGANIZED</p>
            <h1>Welcome back, {displayName}! 👋</h1>
            <p>
              Keep going! Every application brings you closer to your dream job.
            </p>
            <Link to="/add-application" className="primary-btn">
              + Add Application
            </Link>
          </div>

          <img
            src="/assets/dashboard.jpeg"
            alt="Job application dashboard illustration"
          />
        </section>

        {/* Summary Cards */}
        <section className="stats-grid">
          <article className="stat-card">
            <span className="stat-icon">💼</span>
            <p>Total Applications</p>
            <h2>{loading ? "..." : stats.total}</h2>
          </article>

          <article className="stat-card">
            <span className="stat-icon">📨</span>
            <p>Applied</p>
            <h2>{loading ? "..." : stats.applied}</h2>
          </article>

          <article className="stat-card">
            <span className="stat-icon">🎤</span>
            <p>Interviews</p>
            <h2>{loading ? "..." : stats.interview}</h2>
          </article>

          <article className="stat-card">
            <span className="stat-icon">🎉</span>
            <p>Offers</p>
            <h2>{loading ? "..." : stats.offer}</h2>
          </article>
        </section>

        {/* Recent Applications */}
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Recent Applications</h2>
              <p>Your latest job application updates.</p>
            </div>
            <Link to="/my-applications">View All →</Link>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Position</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      {loading
                        ? "Loading applications..."
                        : "No applications yet. Click + Add Application to get started."}
                    </td>
                  </tr>
                ) : (
                  recentApplications.map((app) => {
                    const statusLower = (app.status || "applied").toLowerCase();
                    return (
                      <tr key={app.id}>
                        <td><strong>{app.companyName}</strong></td>
                        <td>{app.position}</td>
                        <td>{formatDate(app.appliedDate)}</td>
                        <td>
                          <span className={`status-badge status-${statusLower}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Statistics and Reminders Grid */}
        <section className="bottom-grid">
          <article className="content-card" id="statistics">
            <h2>Application Progress</h2>
            <p>Check your current job search progress.</p>

            <div className="progress-item">
              <span>Applied</span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stats.appliedPercent}%`, background: "#8b78dc" }}
                ></div>
              </div>
            </div>

            <div className="progress-item">
              <span>Interviews</span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stats.interviewPercent}%`, background: "#63a9df" }}
                ></div>
              </div>
            </div>

            <div className="progress-item">
              <span>Offers</span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${stats.offerPercent}%`, background: "#57b99a" }}
                ></div>
              </div>
            </div>

            <p style={{ marginTop: "16px" }}>
              Offer rate: <strong>{stats.offerRate}</strong>
            </p>
          </article>

          <article className="content-card" id="reminders">
            <h2>Upcoming Interviews & Follow-ups</h2>
            <p>Remember your next important steps.</p>

            <div id="reminderList">
              {reminders.length === 0 ? (
                <div>
                  <p>No upcoming interviews or follow-ups.</p>
                  <p style={{ color: "#8a94a6", fontSize: "13px" }}>
                    Add interview or follow-up dates to your applications to see them here.
                  </p>
                </div>
              ) : (
                reminders.map((item) => (
                  <div key={item.id} className="reminder-item" style={{ borderLeft: item.isOverdue ? "4px solid #ef4444" : "4px solid #6366f1" }}>
                    <strong>
                      {item.type === "Interview" ? "🎤" : "🔔"} {item.type} — {item.company}
                    </strong>
                    <p style={{ color: item.isOverdue ? "#dc2626" : "#475569" }}>
                      {formatDate(item.date)} {item.isOverdue && "(Past Due)"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <br />
        <footer className="dashboard-footer">
          JobTrack © 2026 | Organize your career journey.
        </footer>
      </main>
    </div>
  );
}

export default DashboardPage;
