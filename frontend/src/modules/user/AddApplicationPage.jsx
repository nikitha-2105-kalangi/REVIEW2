import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

export function AddApplicationPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const initialFormState = {
    companyName: "",
    position: "",
    location: "",
    jobType: "",
    appliedDate: getTodayDate(),
    status: "Applied",
    interviewDate: "",
    followUpDate: "",
    jobUrl: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!formData.companyName.trim() || !formData.position.trim()) {
      setMessage({
        text: "Please enter the company name and job position.",
        type: "error",
      });
      return;
    }

    if (formData.jobUrl && !formData.jobUrl.startsWith("http://") && !formData.jobUrl.startsWith("https://")) {
      setMessage({
        text: "Please enter a valid job posting URL starting with http:// or https://",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.applications.create(formData);
      if (response.success) {
        setMessage({
          text: "Application saved successfully! Returning to dashboard...",
          type: "success",
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setMessage({
        text: err.message || "Failed to save application. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-app-layout">
      <Sidebar />

      <main className="add-app-main">
        {/* Header */}
        <header className="add-app-header">
          <div>
            <p className="add-app-eyebrow">YOUR CAREER, ORGANIZED</p>
            <h1>Add New Application</h1>
            <p>Keep all your job opportunities in one place.</p>
          </div>

          <button
            type="button"
            className="add-app-logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout ↗
          </button>
        </header>

        {/* Page Banner */}
        <section className="add-app-banner">
          <div>
            <h2>One step closer to your dream job! ✨</h2>
            <p>
              Record your application details today. Stay organized and never
              miss an opportunity.
            </p>
          </div>

          <img
            src="/assets/my-application.jpeg"
            alt="Organize your job applications"
          />
        </section>

        {/* Form Card */}
        <section className="add-app-card">
          <div className="add-app-section-heading">
            <div>
              <h2>Application Details</h2>
              <p>
                Fill in the information below to save a job. Fields marked * are
                required.
              </p>
            </div>
          </div>

          <form id="applicationForm" onSubmit={handleSubmit}>
            <div className="add-app-form-grid">
              <div className="add-app-field">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  placeholder="e.g. Google"
                  maxLength={100}
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-app-field">
                <label htmlFor="position">Job Position *</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  placeholder="e.g. Software Developer"
                  maxLength={100}
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-app-field">
                <label htmlFor="location">Job Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder="e.g. Hyderabad / Remote"
                  maxLength={100}
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="add-app-field">
                <label htmlFor="jobType">Job Type</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="add-app-field">
                <label htmlFor="appliedDate">Application Date *</label>
                <input
                  type="date"
                  id="appliedDate"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="add-app-field">
                <label htmlFor="status">Application Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="add-app-field">
                <label htmlFor="interviewDate">Interview Date</label>
                <input
                  type="date"
                  id="interviewDate"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleChange}
                />
              </div>

              <div className="add-app-field">
                <label htmlFor="followUpDate">Follow-up Date</label>
                <input
                  type="date"
                  id="followUpDate"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                />
              </div>

              <div className="add-app-field full-width">
                <label htmlFor="jobUrl">Job Posting URL</label>
                <input
                  type="url"
                  id="jobUrl"
                  name="jobUrl"
                  placeholder="https://example.com/job"
                  maxLength={1000}
                  value={formData.jobUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="add-app-field full-width">
                <label htmlFor="description">Job Description / Notes</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={3000}
                  placeholder="Add important details, skills, or notes about this opportunity..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {message.text && (
              <div className={`add-app-message ${message.type}`} role="status">
                {message.text}
              </div>
            )}

            <div className="add-app-form-actions">
              <button
                type="button"
                className="add-app-reset"
                onClick={handleReset}
              >
                Reset Form
              </button>

              <Link to="/dashboard" className="add-app-cancel">
                Cancel
              </Link>

              <button
                type="submit"
                className="add-app-submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Application →"}
              </button>
            </div>
          </form>
        </section>

        <footer className="add-app-footer">
          JobTrack © 2026 | Organize your career journey.
        </footer>
      </main>
    </div>
  );
}

export default AddApplicationPage;
