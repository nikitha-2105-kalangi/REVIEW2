import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

export function InterviewsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [interviews, setInterviews] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterviewsData() {
      try {
        setLoading(true);
        const data = await api.applications.getInterviews();
        if (data.success) {
          setInterviews(data.interviews || []);
          setFollowUps(data.followUps || []);
        }
      } catch (err) {
        console.error("Failed to load interviews:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInterviewsData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date not available";
    const date = new Date(dateStr + "T00:00:00");
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="interviews-layout">
      <Sidebar />

      <main className="interviews-main">
        <header className="interviews-header">
          <p className="interviews-eyebrow">STAY PREPARED</p>
          <h1>Interviews & Follow-ups</h1>
          <p>Keep track of upcoming interviews and follow-up dates.</p>
        </header>

        {/* Banner */}
        <section className="interviews-banner">
          <div className="interviews-banner-text">
            <h2>Every opportunity deserves preparation.</h2>
            <p>Review your upcoming interviews and follow-ups in one place.</p>
          </div>

          <img
            src="/assets/interview-followup.jpeg"
            alt="Job search illustration"
            className="interviews-banner-image"
          />
        </section>

        {/* Upcoming Interviews */}
        <section className="interviews-section">
          <div className="interviews-section-heading">
            <h2>Upcoming Interviews</h2>
            <p>Applications with an interview date.</p>
          </div>

          <div id="upcomingInterviews" className="interviews-list">
            {loading && <p>Loading interviews...</p>}
            {!loading && interviews.length === 0 && (
              <div className="interviews-empty">
                No interview dates recorded yet. Add an interview date to an application to see it here.
              </div>
            )}
            {!loading &&
              interviews.map((item) => (
                <article
                  key={`int-${item.id}`}
                  className={`interview-item ${item.isOverdue ? "overdue" : ""}`}
                >
                  <h3>{item.companyName}</h3>
                  <p>Position: {item.position}</p>
                  <p className="interview-date">
                    Interview: {formatDate(item.date)}
                  </p>
                  <p>Application status: {item.status}</p>
                  {item.isOverdue && (
                    <p style={{ color: "#ef4444", fontWeight: 600 }}>
                      ⚠️ This interview date has passed. Check whether action is still needed.
                    </p>
                  )}
                </article>
              ))}
          </div>
        </section>

        {/* Follow-up Reminders */}
        <section className="interviews-section">
          <div className="interviews-section-heading">
            <h2>Follow-up Reminders</h2>
            <p>Applications that need your attention.</p>
          </div>

          <div id="followUpReminders" className="interviews-list">
            {loading && <p>Loading reminders...</p>}
            {!loading && followUps.length === 0 && (
              <div className="interviews-empty">
                No follow-up dates recorded yet. Add a follow-up date to an application to see it here.
              </div>
            )}
            {!loading &&
              followUps.map((item) => (
                <article
                  key={`fol-${item.id}`}
                  className={`interview-item ${item.isOverdue ? "overdue" : ""}`}
                >
                  <h3>{item.companyName}</h3>
                  <p>Position: {item.position}</p>
                  <p className="interview-date">
                    Follow-up: {formatDate(item.date)}
                  </p>
                  {item.isOverdue && (
                    <p style={{ color: "#ef4444", fontWeight: 600 }}>
                      ⚠️ This follow-up date has passed. Check whether action is still needed.
                    </p>
                  )}
                </article>
              ))}
          </div>
        </section>

        <p id="interviewsMessage" className="interviews-message">
          {!loading &&
            `${interviews.length} interview date(s) and ${followUps.length} follow-up date(s) recorded in your applications.`}
        </p>
      </main>
    </div>
  );
}

export default InterviewsPage;
