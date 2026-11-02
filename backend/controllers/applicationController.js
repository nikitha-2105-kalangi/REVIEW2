const db = require("../config/db");

// 1. Get all applications for the logged-in user with optional search and status filter
function getAllApplications(req, res) {
  try {
    const userId = req.user.id;
    const { search, status } = req.query;

    let query = `
      SELECT id, user_id as userId, company_name as companyName, position,
             description, job_type as jobType, location, applied_date as appliedDate,
             status, interview_date as interviewDate, follow_up_date as followUpDate,
             job_url as jobUrl, notes, created_at as createdAt, updated_at as updatedAt
      FROM job_applications
      WHERE user_id = ?
    `;
    const params = [userId];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (company_name LIKE ? OR position LIKE ?)`;
      params.push(searchTerm, searchTerm);
    }

    if (status && status !== "All") {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY applied_date DESC, id DESC`;

    const applications = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get All Applications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving applications.",
    });
  }
}

// 2. Get a single application by ID
function getApplicationById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const application = db
      .prepare(`
        SELECT id, user_id as userId, company_name as companyName, position,
               description, job_type as jobType, location, applied_date as appliedDate,
               status, interview_date as interviewDate, follow_up_date as followUpDate,
               job_url as jobUrl, notes, created_at as createdAt, updated_at as updatedAt
        FROM job_applications
        WHERE id = ? AND user_id = ?
      `)
      .get(id, userId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get Application By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// 3. Create a new application
function createApplication(req, res) {
  try {
    const userId = req.user.id;
    const {
      companyName,
      position,
      description,
      jobType,
      location,
      appliedDate,
      status,
      interviewDate,
      followUpDate,
      jobUrl,
      notes,
    } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    if (!position || !position.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job position is required.",
      });
    }

    if (!appliedDate) {
      return res.status(400).json({
        success: false,
        message: "Application date is required.",
      });
    }

    const validStatuses = ["Applied", "Interview", "Offer", "Rejected"];
    const appStatus = status && validStatuses.includes(status) ? status : "Applied";

    const insert = db.prepare(`
      INSERT INTO job_applications (
        user_id, company_name, position, description, job_type, location,
        applied_date, status, interview_date, follow_up_date, job_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      userId,
      companyName.trim(),
      position.trim(),
      description ? description.trim() : null,
      jobType || null,
      location ? location.trim() : null,
      appliedDate,
      appStatus,
      interviewDate || null,
      followUpDate || null,
      jobUrl ? jobUrl.trim() : null,
      notes ? notes.trim() : null
    );

    const newApp = db
      .prepare(`
        SELECT id, user_id as userId, company_name as companyName, position,
               description, job_type as jobType, location, applied_date as appliedDate,
               status, interview_date as interviewDate, follow_up_date as followUpDate,
               job_url as jobUrl, notes, created_at as createdAt
        FROM job_applications
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: "Job application saved successfully!",
      application: newApp,
    });
  } catch (error) {
    console.error("Create Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while saving application.",
    });
  }
}

// 4. Update an existing application
function updateApplication(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      companyName,
      position,
      description,
      jobType,
      location,
      appliedDate,
      status,
      interviewDate,
      followUpDate,
      jobUrl,
      notes,
    } = req.body;

    const existing = db
      .prepare("SELECT id FROM job_applications WHERE id = ? AND user_id = ?")
      .get(id, userId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Application not found or unauthorized.",
      });
    }

    if (!companyName || !companyName.trim() || !position || !position.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name and position are required.",
      });
    }

    const validStatuses = ["Applied", "Interview", "Offer", "Rejected"];
    const appStatus = status && validStatuses.includes(status) ? status : "Applied";

    const update = db.prepare(`
      UPDATE job_applications
      SET company_name = ?,
          position = ?,
          description = ?,
          job_type = ?,
          location = ?,
          applied_date = ?,
          status = ?,
          interview_date = ?,
          follow_up_date = ?,
          job_url = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    update.run(
      companyName.trim(),
      position.trim(),
      description !== undefined ? (description ? description.trim() : null) : null,
      jobType || null,
      location ? location.trim() : null,
      appliedDate,
      appStatus,
      interviewDate || null,
      followUpDate || null,
      jobUrl ? jobUrl.trim() : null,
      notes ? notes.trim() : null,
      id,
      userId
    );

    const updated = db
      .prepare(`
        SELECT id, user_id as userId, company_name as companyName, position,
               description, job_type as jobType, location, applied_date as appliedDate,
               status, interview_date as interviewDate, follow_up_date as followUpDate,
               job_url as jobUrl, notes, updated_at as updatedAt
        FROM job_applications
        WHERE id = ? AND user_id = ?
      `)
      .get(id, userId);

    return res.status(200).json({
      success: true,
      message: "Application updated successfully.",
      application: updated,
    });
  } catch (error) {
    console.error("Update Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating application.",
    });
  }
}

// 5. Delete an application
function deleteApplication(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = db
      .prepare("SELECT id FROM job_applications WHERE id = ? AND user_id = ?")
      .get(id, userId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Application not found or unauthorized.",
      });
    }

    db.prepare("DELETE FROM job_applications WHERE id = ? AND user_id = ?").run(id, userId);

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting application.",
    });
  }
}

// 6. User Dashboard Stats
function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    const applications = db
      .prepare(`
        SELECT id, company_name as companyName, position, applied_date as appliedDate,
               status, interview_date as interviewDate, follow_up_date as followUpDate,
               created_at as createdAt
        FROM job_applications
        WHERE user_id = ?
        ORDER BY applied_date DESC, id DESC
      `)
      .all(userId);

    const total = applications.length;
    const applied = applications.filter((a) => a.status === "Applied").length;
    const interview = applications.filter((a) => a.status === "Interview").length;
    const offer = applications.filter((a) => a.status === "Offer").length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;

    const appliedPercent = total ? (applied / total) * 100 : 0;
    const interviewPercent = total ? (interview / total) * 100 : 0;
    const offerPercent = total ? (offer / total) * 100 : 0;
    const offerRate = total ? ((offer / total) * 100).toFixed(1) + "%" : "0%";

    const recent = applications.slice(0, 5);

    // Upcoming reminders
    const today = new Date().toISOString().split("T")[0];
    const reminders = [];

    applications.forEach((app) => {
      if (app.interviewDate) {
        reminders.push({
          id: `int-${app.id}`,
          company: app.companyName,
          position: app.position,
          type: "Interview",
          date: app.interviewDate,
          isOverdue: app.interviewDate < today,
        });
      }
      if (app.followUpDate) {
        reminders.push({
          id: `fol-${app.id}`,
          company: app.companyName,
          position: app.position,
          type: "Follow-up",
          date: app.followUpDate,
          isOverdue: app.followUpDate < today,
        });
      }
    });

    // Sort reminders chronologically
    reminders.sort((a, b) => (a.date > b.date ? 1 : -1));

    return res.status(200).json({
      success: true,
      stats: {
        total,
        applied,
        interview,
        offer,
        rejected,
        appliedPercent,
        interviewPercent,
        offerPercent,
        offerRate,
      },
      recentApplications: recent,
      reminders: reminders.slice(0, 6),
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while loading dashboard statistics.",
    });
  }
}

// 7. Interviews & Reminders
function getInterviews(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const apps = db
      .prepare(`
        SELECT id, company_name as companyName, position, status,
               interview_date as interviewDate, follow_up_date as followUpDate
        FROM job_applications
        WHERE user_id = ? AND (interview_date IS NOT NULL OR follow_up_date IS NOT NULL)
      `)
      .all(userId);

    const interviews = [];
    const followUps = [];

    apps.forEach((app) => {
      if (app.interviewDate) {
        interviews.push({
          id: app.id,
          companyName: app.companyName,
          position: app.position,
          status: app.status,
          date: app.interviewDate,
          isOverdue: app.interviewDate < today,
        });
      }
      if (app.followUpDate) {
        followUps.push({
          id: app.id,
          companyName: app.companyName,
          position: app.position,
          status: app.status,
          date: app.followUpDate,
          isOverdue: app.followUpDate < today,
        });
      }
    });

    interviews.sort((a, b) => (a.date > b.date ? 1 : -1));
    followUps.sort((a, b) => (a.date > b.date ? 1 : -1));

    return res.status(200).json({
      success: true,
      interviews,
      followUps,
    });
  } catch (error) {
    console.error("Interviews Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// 8. Statistics and Analysis
function getStatistics(req, res) {
  try {
    const userId = req.user.id;

    const applications = db
      .prepare(`
        SELECT id, status, applied_date as appliedDate, follow_up_date as followUpDate
        FROM job_applications
        WHERE user_id = ?
      `)
      .all(userId);

    const total = applications.length;
    const counts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };

    applications.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      } else {
        counts.Applied++;
      }
    });

    // Monthly Timeline calculation (past 6 calendar months)
    const now = new Date();
    const months = [];
    const monthlyCounts = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      months.push({ key, label });
      monthlyCounts[key] = 0;
    }

    applications.forEach((app) => {
      if (app.appliedDate) {
        const key = app.appliedDate.substring(0, 7);
        if (monthlyCounts[key] !== undefined) {
          monthlyCounts[key]++;
        }
      }
    });

    const timelineData = months.map((m) => ({
      key: m.key,
      label: m.label,
      count: monthlyCounts[m.key],
    }));

    // Follow-up insights
    const today = new Date().toISOString().split("T")[0];
    let upcomingFollowUps = 0;
    let overdueFollowUps = 0;

    applications.forEach((app) => {
      if (app.followUpDate) {
        if (app.followUpDate < today) {
          overdueFollowUps++;
        } else {
          upcomingFollowUps++;
        }
      }
    });

    const interviewRate = total ? Math.round((counts.Interview / total) * 100) : 0;
    const offerRate = total ? Math.round((counts.Offer / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      total,
      counts,
      timelineData,
      insights: {
        interviewRate,
        offerRate,
        upcomingFollowUps,
        overdueFollowUps,
      },
    });
  } catch (error) {
    console.error("Statistics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getDashboardStats,
  getInterviews,
  getStatistics,
};
