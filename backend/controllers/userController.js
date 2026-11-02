const db = require("../config/db");

// Get Profile
function getProfile(req, res) {
  try {
    const user = db
      .prepare("SELECT id, full_name, email, role, status, created_at FROM users WHERE id = ?")
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// Update Profile
function updateProfile(req, res) {
  try {
    const { fullName } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid full name (at least 2 characters).",
      });
    }

    const trimmedName = fullName.trim();

    db.prepare(`
      UPDATE users
      SET full_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(trimmedName, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: req.user.id,
        fullName: trimmedName,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
