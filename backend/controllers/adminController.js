const db = require("../config/db");

// 1. Get Admin Dashboard Stats
function getAdminStats(req, res) {
  try {
    const totalUsers = db
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'User'")
      .get().count;

    const totalApplications = db
      .prepare("SELECT COUNT(*) as count FROM job_applications")
      .get().count;

    const activeUsers = db
      .prepare("SELECT COUNT(DISTINCT user_id) as count FROM job_applications")
      .get().count;

    const statusBreakdown = db
      .prepare(`
        SELECT status, COUNT(*) as count
        FROM job_applications
        GROUP BY status
      `)
      .all();

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalApplications,
        activeUsers,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching admin statistics.",
    });
  }
}

// 2. Get All Registered Users with Application Count & Search
function getAllUsers(req, res) {
  try {
    const { search } = req.query;

    let query = `
      SELECT u.id, u.full_name as fullName, u.email, u.role, u.status,
             u.created_at as createdAt,
             COUNT(ja.id) as applicationCount
      FROM users u
      LEFT JOIN job_applications ja ON u.id = ja.user_id
      WHERE u.role = 'User'
    `;
    const params = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ?)`;
      params.push(searchTerm, searchTerm);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const users = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching user list.",
    });
  }
}

// 3. Get Individual User Details with their Applications
function getUserDetails(req, res) {
  try {
    const { id } = req.params;

    const user = db
      .prepare(`
        SELECT id, full_name as fullName, email, role, status, created_at as createdAt
        FROM users
        WHERE id = ? AND role = 'User'
      `)
      .get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const applications = db
      .prepare(`
        SELECT id, company_name as companyName, position, applied_date as appliedDate,
               status, interview_date as interviewDate, follow_up_date as followUpDate,
               location, job_type as jobType, created_at as createdAt
        FROM job_applications
        WHERE user_id = ?
        ORDER BY applied_date DESC
      `)
      .all(id);

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        applications,
        applicationCount: applications.length,
      },
    });
  } catch (error) {
    console.error("Admin Get User Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// 4. Toggle or Update User Status (Activate/Deactivate)
function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "inactive"];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed values are 'active' or 'inactive'.",
      });
    }

    const user = db.prepare("SELECT id, role, status FROM users WHERE id = ?").get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "Admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify status of an administrator account.",
      });
    }

    const newStatus = status.toLowerCase();
    db.prepare(`
      UPDATE users
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, id);

    return res.status(200).json({
      success: true,
      message: `User account has been ${newStatus === "active" ? "activated" : "deactivated"} successfully.`,
      status: newStatus,
    });
  } catch (error) {
    console.error("Admin Update User Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// 5. Delete User Account (and cascade their applications)
function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = db.prepare("SELECT id, role, full_name FROM users WHERE id = ?").get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "Admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an administrator account.",
      });
    }

    // Deleting the user will automatically cascade delete job_applications because of ON DELETE CASCADE
    db.prepare("DELETE FROM users WHERE id = ?").run(id);

    return res.status(200).json({
      success: true,
      message: `User account '${user.full_name}' and all associated applications have been deleted.`,
    });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

module.exports = {
  getAdminStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
};
