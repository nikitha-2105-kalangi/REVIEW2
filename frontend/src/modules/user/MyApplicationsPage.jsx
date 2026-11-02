import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

export function MyApplicationsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [pageMessage, setPageMessage] = useState("");

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    companyName: "",
    position: "",
    appliedDate: "",
    status: "Applied",
    interviewDate: "",
    followUpDate: "",
  });

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.applications.getAll({
        search: searchTerm,
        status: statusFilter,
      });
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Load applications error:", err);
      setPageMessage("Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [searchTerm, statusFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr + "T00:00:00");
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async (id, company) => {
    const confirmed = window.confirm(`Delete the application for ${company || "this company"}?`);
    if (!confirmed) return;

    try {
      const response = await api.applications.delete(id);
      if (response.success) {
        setPageMessage("Application deleted successfully.");
        loadApplications();
        setTimeout(() => setPageMessage(""), 3000);
      }
    } catch (err) {
      alert(err.message || "Unable to delete this application.");
    }
  };

  const handleOpenEdit = (app) => {
    setEditFormData({
      id: app.id,
      companyName: app.companyName || "",
      position: app.position || "",
      appliedDate: app.appliedDate || "",
      status: app.status || "Applied",
      interviewDate: app.interviewDate || "",
      followUpDate: app.followUpDate || "",
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.companyName.trim() || !editFormData.position.trim()) {
      alert("Company name and position are required.");
      return;
    }

    try {
      const response = await api.applications.update(editFormData.id, editFormData);
      if (response.success) {
        setIsEditing(false);
        setPageMessage("Application updated successfully.");
        loadApplications();
        setTimeout(() => setPageMessage(""), 3000);
      }
    } catch (err) {
      alert(err.message || "Unable to save changes.");
    }
  };

  return (
    <div className="my-applications-page">
      <div className="my-app-layout">
        <Sidebar />

        <main className="my-app-main">
          {/* Header */}
          <header className="my-app-header">
            <div>
              <p className="my-app-eyebrow">YOUR CAREER, ORGANIZED</p>
              <h1>My Applications</h1>
              <p>Manage and track all your job opportunities.</p>
            </div>

            <div className="my-app-header-actions">
              <Link to="/add-application" className="my-app-add-btn">
                + Add Application
              </Link>

              <button
                type="button"
                className="my-app-logout"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout ↗
              </button>
            </div>
          </header>

          {/* Banner */}
          <section className="my-app-banner">
            <div>
              <h2>Your job search, all in one place. ✨</h2>
              <p>
                Review your applications, update their status, and keep track of
                your next career opportunity.
              </p>
            </div>

            <img
              src="/assets/add-application.jpeg"
              alt="Organized job search"
            />
          </section>

          {/* Application list card */}
          <section className="my-app-card">
            <div className="my-app-section-heading">
              <div>
                <h2>All Applications</h2>
                <p id="resultsText">
                  {loading
                    ? "Loading applications..."
                    : `Showing ${applications.length} applications`}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="my-app-controls">
              <input
                type="search"
                id="searchInput"
                placeholder="🔍 Search company or position..."
                aria-label="Search applications"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                id="statusFilter"
                aria-label="Filter by application status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {pageMessage && (
              <p className="my-app-message" style={{ color: "#2563eb", marginBottom: "16px" }}>
                {pageMessage}
              </p>
            )}

            {/* Empty State */}
            {!loading && applications.length === 0 && (
              <div className="my-app-empty">
                <img
                  src="/assets/dashboard.jpeg"
                  alt="Job application illustration"
                />
                <h3>
                  {searchTerm || statusFilter !== "All"
                    ? "No matching applications"
                    : "No applications yet"}
                </h3>
                <p>
                  {searchTerm || statusFilter !== "All"
                    ? "Try a different search term or status filter."
                    : "Add your first job application to get started."}
                </p>
                <Link to="/add-application" className="my-app-add-btn">
                  + Add Application
                </Link>
              </div>
            )}

            {/* Applications Table */}
            {applications.length > 0 && (
              <div className="my-app-table-wrapper">
                <table className="my-app-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Position</th>
                      <th>Applied Date</th>
                      <th>Status</th>
                      <th>Interview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((app) => {
                      const statusClass = (app.status || "applied").toLowerCase();
                      return (
                        <tr key={app.id}>
                          <td>
                            <span className="my-app-company">
                              {app.companyName}
                            </span>
                          </td>
                          <td>{app.position}</td>
                          <td>{formatDate(app.appliedDate)}</td>
                          <td>
                            <span className={`my-app-status ${statusClass}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>{formatDate(app.interviewDate)}</td>
                          <td>
                            <div className="my-app-row-actions">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(app)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() => handleDelete(app.id, app.companyName)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="my-app-footer">
            JobTrack © 2026 | Organize your career journey.
          </footer>
        </main>
      </div>

      {/* Edit Dialog / Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveEdit} className="my-app-dialog" style={{ display: "block" }}>
              <h2>Edit Application</h2>
              <p>Update the details of your saved application.</p>

              <label htmlFor="editCompany">Company Name *</label>
              <input
                type="text"
                id="editCompany"
                name="companyName"
                maxLength={100}
                value={editFormData.companyName}
                onChange={handleEditChange}
                required
              />

              <label htmlFor="editPosition">Job Position *</label>
              <input
                type="text"
                id="editPosition"
                name="position"
                maxLength={100}
                value={editFormData.position}
                onChange={handleEditChange}
                required
              />

              <label htmlFor="editAppliedDate">Application Date *</label>
              <input
                type="date"
                id="editAppliedDate"
                name="appliedDate"
                value={editFormData.appliedDate}
                onChange={handleEditChange}
                required
              />

              <label htmlFor="editStatus">Application Status *</label>
              <select
                id="editStatus"
                name="status"
                value={editFormData.status}
                onChange={handleEditChange}
                required
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>

              <label htmlFor="editInterviewDate">Interview Date</label>
              <input
                type="date"
                id="editInterviewDate"
                name="interviewDate"
                value={editFormData.interviewDate}
                onChange={handleEditChange}
              />

              <label htmlFor="editFollowUpDate">Follow-up Date</label>
              <input
                type="date"
                id="editFollowUpDate"
                name="followUpDate"
                value={editFormData.followUpDate}
                onChange={handleEditChange}
              />

              <div className="my-app-dialog-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="my-app-cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="my-app-add-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyApplicationsPage;
