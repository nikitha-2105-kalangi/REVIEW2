# JobTrack – Online Job Application Tracker
### Upgraded Full-Stack Architecture: React.js (Vite) + Node.js + Express.js + SQLite

---

## 1. Project Overview

**JobTrack** has been upgraded from a client-side prototype into a full-stack, multi-user web application. All original design layouts, color palettes, Poppins typography, logos, and illustration assets have been preserved.

### Core Stack
- **Frontend:** React.js (Vite) with React Router v7 & Chart.js
- **Backend:** Node.js + Express.js
- **Database:** Persistent SQLite (`better-sqlite3`) with WAL mode & Foreign Key constraints
- **API Communication:** Native Fetch API with JSON Web Token (JWT) Bearer authentication
- **Security:** Bcrypt password hashing, Role-Based Access Control (RBAC), protected routes

---

## 2. Architecture & Modules

The application is structured into three primary modules:

### 1. User Management Module
- **User Dashboard:** Total applications, applied, interview, and offer counts; real-time application progress bars; calculated offer rate; recent applications table; upcoming interview and follow-up reminders.
- **Add Application:** Add job opportunities with company name, job position, location, job type dropdown, application date, status dropdown, interview date, follow-up date, job posting URL, and description/notes.
- **My Applications:** View all saved applications; live search by company or position; filter by status (Applied, Interview, Offer, Rejected); inline modal editing; application deletion with confirmation.
- **Interviews & Follow-ups:** Dedicated view separating upcoming interviews from follow-up reminders; automatic overdue highlighting for dates that have passed.
- **Statistics & Analysis:** Interactive Chart.js status doughnut chart and monthly submissions timeline bar chart; automated conversion rates (interview rate, offer rate, most common status, upcoming vs overdue follow-ups).
- **User Profile:** View registered account details and update full name in real time with avatar letter reflection.
- **Strict Data Isolation:** Applications are strictly linked to `user_id`. Each user only ever sees and modifies their own applications.

### 2. Admin Management Module
- **Separate Admin Portal:** Accessible via `/admin-login` with distinct branding and credentials validation.
- **Admin Dashboard:** Displays Total Registered Users, Total Job Applications, Active Users (users who have submitted applications), and system-wide application status breakdown.
- **User Management Table:**
  1. View all registered accounts with registration date and application count.
  2. Live search by user name or email.
  3. View user details modal with a list of all applications submitted by that specific user.
  4. Instant account activation/deactivation toggle (deactivated users are blocked from logging in).
  5. Delete user accounts (with cascading deletion of their applications).
- **Protected Admin Routes & APIs:** Normal users cannot access admin endpoints (`403 Forbidden`).

### 3. Registration & Authentication Module
- **Secure Endpoints:**
  - `POST /api/auth/register` – Duplicate email prevention, password validation (min 6 characters, password match check), bcrypt hashing.
  - `POST /api/auth/login` – Normal user authentication and JWT generation.
  - `POST /api/auth/admin-login` – Dedicated administrator validation (`role = 'Admin'`).
  - `GET /api/auth/me` – Token verification and session retrieval.
  - `POST /api/auth/logout` – Session termination.
- **Initial Admin Account:** Automatically seeded into SQLite on first startup from environment variables:
  - **Email:** `admin@jobtrack.com`
  - **Password:** `Admin@123456`

---

## 3. Directory Layout

```text
Job TRACK/
├── assets/                     # Original image assets (preserved)
├── css/                        # Original CSS stylesheets (preserved)
├── js/                         # Original JavaScript files (preserved)
├── package.json                # Root scripts configuration
├── backend/
│   ├── .env                    # Environment configuration (Port, JWT Secret, Admin seed)
│   ├── jobtrack.db             # Persistent SQLite database file
│   ├── package.json            # Backend dependencies
│   ├── server.js               # Express application entry point
│   ├── config/
│   │   └── db.js               # SQLite connection, schema creation, admin seed
│   ├── controllers/
│   │   ├── authController.js   # Registration, login, admin-login, me
│   │   ├── userController.js   # Profile retrieval and update
│   │   ├── applicationController.js # Applications CRUD, stats, interviews
│   │   └── adminController.js  # User management, stats, status toggle, delete
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification & requireAdmin role guard
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── adminRoutes.js
│   ├── test_api.js             # Basic automated API test suite
│   └── test_e2e_full.js        # Comprehensive 15-suite end-to-end verification
└── frontend/
    ├── package.json            # React + Vite dependencies
    ├── vite.config.js          # Vite config with /api proxy to port 5000
    ├── index.html              # Poppins font, JobTrack branding
    └── src/
        ├── App.jsx             # React Router v7 configuration
        ├── main.jsx            # Entry point with BrowserRouter & AuthProvider
        ├── index.css           # Master stylesheet integrating all original CSS
        ├── assets/             # Bundled application image assets
        ├── components/
        │   ├── Sidebar.jsx     # Navigation sidebar (User & Admin modes)
        │   └── ProtectedRoute.jsx # Route guards for authenticated users & admins
        ├── context/
        │   └── AuthContext.jsx # Global auth state & JWT persistence
        ├── services/
        │   └── api.js          # Fetch API client abstraction
        ├── pages/
        │   └── LandingPage.jsx # Original landing page converted to React
        └── modules/
            ├── registration/
            │   ├── SignupPage.jsx
            │   ├── LoginPage.jsx
            │   └── AdminLoginPage.jsx
            ├── user/
            │   ├── DashboardPage.jsx
            │   ├── AddApplicationPage.jsx
            │   ├── MyApplicationsPage.jsx
            │   ├── InterviewsPage.jsx
            │   ├── StatisticsPage.jsx
            │   └── ProfilePage.jsx
            └── admin/
                └── AdminDashboardPage.jsx
```

---

## 4. How to Run the Application

### Prerequisites
- Node.js (v18+ or v24+)
- npm

### Step 1: Start the Backend Server
Open a terminal in the project directory:
```bash
cd backend
npm start
```
The backend server will start on `http://localhost:5000` and display:
```
===============================================
 JobTrack Express Backend Server Started!      
 Running on: http://localhost:5000          
 Database: SQLite (jobtrack.db)                
 Initial Admin: admin@jobtrack.com             
===============================================
```

### Step 2: Start the Frontend Application
Open a second terminal in the project directory:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 5. Automated Verification Testing

You can run the end-to-end test suite at any time:

```bash
cd backend
npm test
```
Or run the full 15-scenario verification suite:
```bash
node backend/test_e2e_full.js
```

All 15 test suites cover:
1. Server health check
2. User registration and input validation
3. Duplicate email rejection
4. User login and JWT issuance
5. Session verification (`/api/auth/me`)
6. Profile name update
7. Job applications creation
8. Live search and status filtering
9. Application editing
10. Dashboard summary metrics and progress bars
11. Interviews and follow-up reminders
12. Statistical calculations and timeline charting
13. Strict multi-user data isolation (User B cannot view or access User A data)
14. Application deletion
15. Admin login, user status activation/deactivation, and cascading user account deletion

---

## 6. Manual Verification Guide

### 1. Test User Journey
1. Open `http://localhost:5173/` and click **Get Started →**.
2. Register a new user (e.g. `jane@example.com` / `Password123!`).
3. Log in with the registered credentials.
4. On the **Dashboard**, view the summary cards and click **+ Add Application**.
5. Add an application (e.g. Company: `Google`, Position: `Software Engineer`, Status: `Interview`, Interview Date: `2026-03-20`, Follow-up Date: `2026-03-21`).
6. Navigate to **My Applications** to verify the entry. Test searching for "Google" and filtering by status "Interview".
7. Click **Edit** to change the status to "Offer". Verify the update.
8. Navigate to **Interviews & Follow-ups** to see the interview date listed.
9. Navigate to **Statistics** to see the Doughnut chart and timeline chart update.
10. Navigate to **Profile** to update your name. Verify the avatar updates.
11. Click **Logout**.

### 2. Test Multi-User Data Isolation
1. Register a second user (e.g. `mark@example.com`).
2. Log in as Mark.
3. Verify that **Dashboard** and **My Applications** show 0 applications (Mark cannot see Jane's applications).
4. Log out and log back in as Jane. Verify Jane's applications are intact.

### 3. Test Admin Portal
1. Navigate to `http://localhost:5173/admin-login` (or click "Administrator Access Portal" from the home or login page).
2. Log in using seeded admin credentials:
   - **Email:** `admin@jobtrack.com`
   - **Password:** `Admin@123456`
3. View the **Admin Dashboard** with total registered users, applications, and active users.
4. Search for "Jane" in the user management table.
5. Click **View Details** to inspect Jane's submitted applications.
6. Click **Deactivate** to deactivate Jane's account.
7. Open an incognito window and try to log in as Jane: verify the account is blocked (`403 Account Deactivated`).
8. Return to the admin dashboard and click **Activate** to restore Jane's account.
