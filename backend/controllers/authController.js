const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "jobtrack_super_secure_jwt_secret_key_2026_production";
const JWT_EXPIRES_IN = "7d";

// 1. User Registration
function register(req, res) {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter your full name (at least 2 characters).",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Check if email already registered
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please log in.",
      });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insert user with role 'User'
    const insert = db.prepare(`
      INSERT INTO users (full_name, email, password, role, status)
      VALUES (?, ?, ?, 'User', 'active')
    `);
    const result = insert.run(trimmedName, normalizedEmail, hashedPassword);

    return res.status(201).json({
      success: true,
      message: "Account created successfully! You can now log in.",
      user: {
        id: result.lastInsertRowid,
        fullName: trimmedName,
        email: normalizedEmail,
        role: "User",
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration.",
    });
  }
}

// 2. User Login
function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password. Please try again.",
      });
    }

    // Normal users only
    if (user.role === "Admin") {
      return res.status(400).json({
        success: false,
        message: "Admin accounts must log in through the Admin Portal.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact an administrator.",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password. Please try again.",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login.",
    });
  }
}

// 3. Admin Login
function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);

    if (!user || user.role !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This admin account is deactivated.",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Admin authentication successful!",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: "Admin",
      },
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during admin authentication.",
    });
  }
}

// 4. Current Logged-in User Info (/me)
function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      fullName: req.user.full_name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      createdAt: req.user.created_at,
    },
  });
}

// 5. Logout
function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  logout,
};
