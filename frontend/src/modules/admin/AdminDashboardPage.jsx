import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    activeUsers: 0,
    statusBreakdown: [],
  });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Modal for Viewing User Details
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers({ search: searchTerm }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
      }
      if (usersRes.success) {
        setUsers(usersRes.users || []);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
      setMessage("Failed to load administration data. Please check admin authorization.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [searchTerm]);

  const handleToggleStatus = async (userItem) => {
    const nextStatus = userItem.status === "active" ? "inactive" : "active";
    const confirmMsg = `Are you sure you want to ${
      nextStatus === "inactive" ? "deactivate" : "activate"
    } ${userItem.fullName}'s account?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await api.admin.updateUserStatus(userItem.id, nextStatus);
      if (response.success) {
        setMessage(response.message);
        loadAdminData();
        setTimeout(() => setMessage(""), 3500);
      }
    } catch (err) {
      alert(err.message || "Unable to update user status.");
    }
  };

  const handleDeleteUser = async (userItem) => {
    const confirmMsg = `WARNING: Are you sure you want to permanently delete user account '${userItem.fullName}'? All ${userItem.applicationCount} associated job applications will also be deleted!`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await api.admin.deleteUser(userItem.id);
      if (response.success) {
        setMessage(response.message);
        loadAdminData();
        setTimeout(() => setMessage(""), 3500);
      }
    } catch (err) {
      alert(err.message || "Failed to delete user account.");
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      setLoadingDetails(true);
      const res = await api.admin.getUserDetails(userId);
      if (res.success) {
        setSelectedUser(res.user);
      }
    } catch (err) {
      alert(err.message || "Failed to load user details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-layout">
      <Sidebar isAdminSidebar={true} />

      <main className="admin-main">
        <header className="admin-header">
          <p className="admin-eyebrow">ADMINISTRATION</p>
          <h1>Admin Dashboard</h1>
          <p>
            Monitor JobTrack system metrics, track platform activity, and manage
            registered users with full administrative control.
          </p>
        </header>

        {message && (
          <div
            style={{
              padding: "12px 18px",
              background: "#dbeafe",
              color: "#1e40af",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}

        {/* Summary Stats */}
        <section className="admin-stats">
          <article className="admin-stat-card">
            <span>Total Registered Users</span>
            <h2>{loading ? "..." : stats.totalUsers}</h2>
          </article>

          <article className="admin-stat-card">
            <span>Total Job Applications</span>
            <h2>{loading ? "..." : stats.totalApplications}</h2>
          </article>

          <article className="admin-stat-card">
            <span>Users with Applications</span>
            <h2>{loading ? "..." : stats.activeUsers}</h2>
          </article>
        </section>

        {/* System Applications Status Breakdown */}
        {stats.statusBreakdown && stats.statusBreakdown.length > 0 && (
          <section
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "18px 24px",
              marginBottom: "24px",
              border: "1px solid #eeeaf6",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "#302a43" }}>
              Overall Application Status Across All Users:
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {stats.statusBreakdown.map((s) => (
                <div
                  key={s.status}
                  style={{
                    padding: "6px 14px",
                    background: "#f3f0ff",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#5b21b6",
                    fontWeight: 600,
                  }}
                >
                  {s.status}: {s.count}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Registered Users Section */}
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <h2>Registered Users Management</h2>
              <p>
                View all registered accounts, monitor activity, change account
                statuses, or remove accounts.
              </p>
            </div>

            <input
              type="search"
              id="userSearch"
              placeholder="Search by name or email..."
              aria-label="Search registered users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Applications</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>

              <tbody id="usersTableBody">
                {loading && (
                  <tr>
                    <td colSpan="6">Loading registered users...</td>
                  </tr>
                )}

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      {searchTerm
                        ? "No users match your search."
                        : "No registered users found in database."}
                    </td>
                  </tr>
                )}

                {!loading &&
                  users.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.fullName}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          ID: #{item.id}
                        </div>
                      </td>
                      <td>{item.email}</td>
                      <td>
                        <span className={`admin-badge ${item.status}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: item.applicationCount > 0 ? "#7c3aed" : "#94a3b8",
                          }}
                        >
                          {item.applicationCount} application(s)
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-view"
                          onClick={() => handleViewDetails(item.id)}
                        >
                          View Details
                        </button>

                        <button
                          type="button"
                          className="admin-btn-action admin-btn-toggle"
                          onClick={() => handleToggleStatus(item)}
                        >
                          {item.status === "active" ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          className="admin-btn-action admin-btn-delete"
                          onClick={() => handleDeleteUser(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && (
            <p className="admin-message">
              Showing {users.length} of {stats.totalUsers} registered user accounts.
            </p>
          )}
        </section>
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2>User Account Overview</h2>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", marginBottom: "20px" }}>
              <p style={{ margin: "4px 0" }}><strong>Full Name:</strong> {selectedUser.fullName}</p>
              <p style={{ margin: "4px 0" }}><strong>Email:</strong> {selectedUser.email}</p>
              <p style={{ margin: "4px 0" }}><strong>Role:</strong> {selectedUser.role}</p>
              <p style={{ margin: "4px 0" }}>
                <strong>Account Status:</strong>{" "}
                <span className={`admin-badge ${selectedUser.status}`}>
                  {selectedUser.status}
                </span>
              </p>
              <p style={{ margin: "4px 0" }}><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
            </div>

            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>
              Submitted Applications ({selectedUser.applicationCount})
            </h3>

            {selectedUser.applications && selectedUser.applications.length === 0 ? (
              <p style={{ color: "#64748b" }}>This user has not submitted any job applications yet.</p>
            ) : (
              <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead style={{ background: "#f1f5f9" }}>
                    <tr>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>Company</th>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>Position</th>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "8px 10px", textAlign: "left" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.applications.map((app) => (
                      <tr key={app.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px 10px" }}><strong>{app.companyName}</strong></td>
                        <td style={{ padding: "8px 10px" }}>{app.position}</td>
                        <td style={{ padding: "8px 10px" }}>{formatDate(app.appliedDate)}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span className={`status-badge status-${(app.status || "").toLowerCase()}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                type="button"
                className="my-app-cancel-btn"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
