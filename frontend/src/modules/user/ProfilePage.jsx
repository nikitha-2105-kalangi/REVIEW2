import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfileState } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!fullName.trim()) {
      setMessage({ text: "Please enter your full name.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const response = await api.user.updateProfile({ fullName: fullName.trim() });
      if (response.success) {
        updateProfileState({ fullName: fullName.trim() });
        setMessage({ text: "Profile name updated successfully.", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (err) {
      setMessage({
        text: err.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const initialLetter = (fullName || email || "U").trim().charAt(0).toUpperCase();

  return (
    <div className="profile-layout">
      <Sidebar />

      <main className="profile-main">
        {/* Topbar */}
        <header className="profile-topbar">
          <div>
            <p className="profile-eyebrow">YOUR PERSONAL SPACE</p>
            <h1>My Profile</h1>
            <p className="profile-subtitle">Your account, your career journey.</p>
          </div>
          <div className="profile-top-icon">✦</div>
        </header>

        {/* Hero Banner */}
        <section className="profile-hero">
          <div className="profile-hero-content">
            <span className="profile-hero-label">YOUR CAREER JOURNEY</span>
            <h2>Every great career<br />starts with a plan.</h2>
            <p>
              Keep your details up to date and stay organized as you work towards
              your next opportunity.
            </p>
          </div>

          <div className="profile-hero-visual">
            <img
              src="/assets/profile.jpeg"
              alt="JobTrack career planning illustration"
            />
          </div>
        </section>

        {/* Profile Overview */}
        <section className="profile-overview">
          <div className="profile-identity-card">
            <div className="profile-avatar">{initialLetter}</div>

            <div className="profile-identity-text">
              <span className="profile-small-label">YOUR ACCOUNT</span>
              <h2>{fullName || "JobTrack User"}</h2>
              <p>{email}</p>
              <span className="profile-member-tag">✦ JobTrack Member</span>
            </div>
          </div>

          <div className="profile-tip-card">
            <div className="profile-tip-icon">✧</div>
            <div>
              <h3>Small steps matter</h3>
              <p>
                Keep your profile accurate so your career journey stays organized.
              </p>
            </div>
          </div>
        </section>

        {/* Account Details Form */}
        <section className="profile-details-card">
          <div className="profile-section-heading">
            <div>
              <span className="profile-small-label">PERSONAL INFORMATION</span>
              <h2>Account Details</h2>
              <p>Update your name and review your registered email.</p>
            </div>
            <span className="profile-edit-icon">✎</span>
          </div>

          <form id="profileForm" onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="profileName">Full Name</label>
                <input
                  type="text"
                  id="profileName"
                  name="profileName"
                  placeholder="Enter your full name"
                  maxLength={80}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profileEmail">Email Address</label>
                <input
                  type="email"
                  id="profileEmail"
                  name="profileEmail"
                  value={email}
                  readOnly
                />
                <small>Your registered email cannot be changed here.</small>
              </div>
            </div>

            <div className="profile-form-footer">
              {message.text && (
                <p className={`profile-message ${message.type}`} role="status">
                  {message.text}
                </p>
              )}

              <button type="submit" className="profile-save" disabled={loading}>
                {loading ? "Saving Changes..." : "Save Changes"} <span>→</span>
              </button>
            </div>
          </form>
        </section>

        <footer className="profile-footer">
          Made for your next opportunity. <span>♥</span> JobTrack
        </footer>
      </main>
    </div>
  );
}

export default ProfilePage;
