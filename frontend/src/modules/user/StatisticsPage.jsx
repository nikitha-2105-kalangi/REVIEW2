import React, { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

Chart.register(...registerables);

export function StatisticsPage() {
  const statusCanvasRef = useRef(null);
  const timelineCanvasRef = useRef(null);
  const statusChartInstance = useRef(null);
  const timelineChartInstance = useRef(null);

  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatistics() {
      try {
        setLoading(true);
        const data = await api.applications.getStatistics();
        if (data.success) {
          setStatsData(data);
        }
      } catch (err) {
        console.error("Error loading statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStatistics();
  }, []);

  useEffect(() => {
    if (!statsData || loading) return;

    const { total, counts, timelineData } = statsData;

    // 1. Status Doughnut Chart
    if (statusCanvasRef.current) {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }

      statusChartInstance.current = new Chart(statusCanvasRef.current, {
        type: "doughnut",
        data: {
          labels: ["Applied", "Interview", "Offers", "Rejected"],
          datasets: [
            {
              data: [
                counts.Applied || 0,
                counts.Interview || 0,
                counts.Offer || 0,
                counts.Rejected || 0,
              ],
              backgroundColor: ["#8B78DC", "#63A9DF", "#57B99A", "#E89AAB"],
              borderColor: "#FFFFFF",
              borderWidth: 4,
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "65%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 18,
                usePointStyle: true,
                font: { family: "Poppins", size: 13 },
              },
            },
            tooltip: {
              callbacks: {
                label(context) {
                  const value = context.raw;
                  const pct = total ? Math.round((value / total) * 100) : 0;
                  return `${context.label}: ${value} (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }

    // 2. Monthly Timeline Bar Chart
    if (timelineCanvasRef.current && timelineData) {
      if (timelineChartInstance.current) {
        timelineChartInstance.current.destroy();
      }

      timelineChartInstance.current = new Chart(timelineCanvasRef.current, {
        type: "bar",
        data: {
          labels: timelineData.map((d) => d.label),
          datasets: [
            {
              label: "Applications submitted",
              data: timelineData.map((d) => d.count),
              backgroundColor: "#9A88E8",
              hoverBackgroundColor: "#7763CF",
              borderRadius: 8,
              maxBarThickness: 42,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label(context) {
                  return `${context.raw} application(s)`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0, font: { family: "Poppins" } },
              grid: { color: "#EEEAF6" },
              title: {
                display: true,
                text: "Number of applications",
                font: { family: "Poppins" },
              },
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: "Poppins" } },
            },
          },
        },
      });
    }

    return () => {
      if (statusChartInstance.current) statusChartInstance.current.destroy();
      if (timelineChartInstance.current) timelineChartInstance.current.destroy();
    };
  }, [statsData, loading]);

  const counts = statsData?.counts || { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
  const total = statsData?.total || 0;
  const insights = statsData?.insights || { interviewRate: 0, offerRate: 0, upcomingFollowUps: 0, overdueFollowUps: 0 };
  const timelineData = statsData?.timelineData || [];

  // Trend analysis
  let trendText = "Your monthly trend will appear after you add applications.";
  if (timelineData.length >= 2) {
    const currentMonth = timelineData[timelineData.length - 1].count;
    const prevMonth = timelineData[timelineData.length - 2].count;
    if (currentMonth > prevMonth) {
      trendText = `Your application activity has increased compared with last month. This month: ${currentMonth} application(s).`;
    } else if (currentMonth < prevMonth) {
      trendText = `Your application activity has decreased compared with last month. This month: ${currentMonth} application(s).`;
    } else {
      trendText = `Your application activity is unchanged from last month. This month: ${currentMonth} application(s).`;
    }
  }

  // Most common status
  const getMostCommonStatus = () => {
    const entries = Object.entries(counts);
    const max = Math.max(...entries.map((e) => e[1]));
    if (max === 0) return "No application data recorded yet.";
    const winners = entries.filter((e) => e[1] === max).map((e) => e[0]);
    if (winners.length > 1) return `Your applications are tied across: ${winners.join(", ")}.`;
    return `${winners[0]} is your most common status (${max} application(s)).`;
  };

  return (
    <div className="dashboard-container" style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar />

      <main className="statistics-main" style={{ flex: 1, padding: "32px" }}>
        <header className="statistics-header">
          <div>
            <p className="statistics-eyebrow">YOUR CAREER AT A GLANCE</p>
            <h1>Statistics & Analysis</h1>
            <p>Understand your job search through your application data.</p>
          </div>
        </header>

        {/* Application Status Chart */}
        <section className="statistics-panel">
          <h2>Application Status Distribution</h2>
          <p>See how your applications are distributed across each status.</p>

          <div className="chart-container doughnut-container" style={{ position: "relative", height: "300px" }}>
            <canvas ref={statusCanvasRef}></canvas>
          </div>

          <div id="statusAnalysis" className="analysis-message">
            {total === 0
              ? "No applications yet. Add your first application to begin tracking your job search."
              : `You have ${total} application(s). ${insights.interviewRate}% have reached the interview stage, and ${insights.offerRate}% have resulted in offers.`}
          </div>
        </section>

        {/* Applications Over Time */}
        <section className="statistics-panel">
          <h2>Applications Over Time</h2>
          <p>Track how many applications you submitted each month.</p>

          <div className="chart-container" style={{ position: "relative", height: "280px" }}>
            <canvas ref={timelineCanvasRef}></canvas>
          </div>

          <div id="timelineAnalysis" className="analysis-message">
            {total === 0 ? "Your monthly trend will appear after you add applications." : trendText}
          </div>
        </section>

        {/* Career Insights */}
        <section className="statistics-panel">
          <h2>Career Insights</h2>
          <p>Useful observations calculated from your saved applications.</p>

          <div className="insights-list">
            <div className="insight-item">
              <h3>Interview conversion</h3>
              <p>{insights.interviewRate}% of your recorded applications are currently marked Interview.</p>
            </div>

            <div className="insight-item">
              <h3>Offer rate</h3>
              <p>{insights.offerRate}% of your recorded applications are currently marked Offer.</p>
            </div>

            <div className="insight-item">
              <h3>Most common status</h3>
              <p>{getMostCommonStatus()}</p>
            </div>

            <div className="insight-item">
              <h3>Follow-up reminders</h3>
              <p>
                {insights.upcomingFollowUps} upcoming follow-up(s) and {insights.overdueFollowUps} past-due follow-up(s) recorded.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StatisticsPage;
