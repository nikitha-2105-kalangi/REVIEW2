import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Sidebar({ isAdminSidebar = false }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(isAdminSidebar ? "/admin-login" : "/login");
  };

  if (isAdminSidebar) {
    return (
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src="/assets/job track logo.jpeg" alt="JobTrack Logo" />
        </div>

        <nav className="admin-nav">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            🏠 User Dashboard
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            🛡️ Admin Dashboard
          </NavLink>
        </nav>

        <div className="sidebar-bottom-image" style={{ marginTop: "auto", marginBottom: "20px" }}>
          <img src="/assets/sidebar-image.jpeg" alt="JobTrack illustration" style={{ width: "100%", borderRadius: "12px" }} />
        </div>

        <button type="button" onClick={handleLogout} className="admin-logout">
          Logout
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-image">
        <img src="/assets/job track logo.jpeg" alt="JobTrack Logo" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/my-applications" className={({ isActive }) => (isActive ? "active" : "")}>
          📋 My Applications
        </NavLink>
        <NavLink to="/interviews" className={({ isActive }) => (isActive ? "active" : "")}>
          📅 Interviews & Follow-ups
        </NavLink>
        <NavLink to="/statistics" className={({ isActive }) => (isActive ? "active" : "")}>
          📊 Statistics
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
          👤 My Profile
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            🛡️ Admin
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom-image">
        <img src="/assets/sidebar-image.jpeg" alt="JobTrack illustration" />
      </div>

      <p className="sidebar-note">
        Your career journey, organized in one place.
      </p>

      <button
        type="button"
        onClick={handleLogout}
        className="logout-btn"
        style={{ marginTop: "14px", width: "100%" }}
      >
        Logout ↗
      </button>
    </aside>
  );
}

export default Sidebar;
