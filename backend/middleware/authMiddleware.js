const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "jobtrack_super_secure_jwt_secret_key_2026_production";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided or invalid format.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = db
      .prepare("SELECT id, full_name, email, role, status, created_at FROM users WHERE id = ?")
      .get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists. Please log in again.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact an administrator.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Administrator privileges required.",
    });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
};
