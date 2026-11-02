const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const dbPath = path.join(__dirname, "..", "jobtrack.db");
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for performance & concurrency
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

function initDatabase() {
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User',
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Job Applications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      position TEXT NOT NULL,
      description TEXT,
      job_type TEXT,
      location TEXT,
      applied_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Applied',
      interview_date TEXT,
      follow_up_date TEXT,
      job_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_apps_user_id ON job_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_apps_status ON job_applications(status);
    CREATE INDEX IF NOT EXISTS idx_apps_applied_date ON job_applications(applied_date);
  `);

  // Seed default Admin if not exists
  seedAdmin();
}

function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@jobtrack.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
  const adminName = process.env.ADMIN_NAME || "JobTrack Admin";

  const existingAdmin = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);

  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(adminPassword, salt);

    const insertAdmin = db.prepare(`
      INSERT INTO users (full_name, email, password, role, status)
      VALUES (?, ?, ?, 'Admin', 'active')
    `);

    insertAdmin.run(adminName, adminEmail, hashedPassword);
    console.log(`[Database] Initial admin account seeded successfully (${adminEmail})`);
  }
}

initDatabase();

module.exports = db;
