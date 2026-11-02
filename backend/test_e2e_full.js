const http = require("http");

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "localhost",
      port: 5000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runFullVerification() {
  console.log("\n========================================================");
  console.log("🚀 STARTING JOBTRACK COMPLETE END-TO-END VERIFICATION TEST");
  console.log("========================================================\n");

  // Step 1: Health Check
  const health = await request("GET", "/api/health");
  console.log(`[TEST 1] Backend Health Check: HTTP ${health.status}`);
  if (health.status !== 200) throw new Error("Health check failed");

  // Step 2: User A Registration & Validation Checks
  const userAEmail = `charlie_${Date.now()}@example.com`;
  console.log(`[TEST 2] Registering User A (${userAEmail})...`);

  // Invalid password check
  const weakPass = await request("POST", "/api/auth/register", {
    fullName: "Charlie",
    email: userAEmail,
    password: "123",
    confirmPassword: "123",
  });
  console.log(`  - Short password rejection: HTTP ${weakPass.status} (${weakPass.body.message})`);
  if (weakPass.status !== 400) throw new Error("Short password validation failed");

  // Mismatched passwords check
  const mismatchPass = await request("POST", "/api/auth/register", {
    fullName: "Charlie",
    email: userAEmail,
    password: "Password123!",
    confirmPassword: "DifferentPassword!",
  });
  console.log(`  - Password mismatch rejection: HTTP ${mismatchPass.status} (${mismatchPass.body.message})`);
  if (mismatchPass.status !== 400) throw new Error("Password mismatch validation failed");

  // Valid registration
  const regA = await request("POST", "/api/auth/register", {
    fullName: "Charlie Candidate",
    email: userAEmail,
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  console.log(`  - User A registration: HTTP ${regA.status} (${regA.body.message})`);
  if (regA.status !== 201) throw new Error("User A registration failed");

  // Duplicate email prevention
  const dup = await request("POST", "/api/auth/register", {
    fullName: "Charlie Clone",
    email: userAEmail,
    password: "Password123!",
  });
  console.log(`  - Duplicate email rejection: HTTP ${dup.status} (${dup.body.message})`);
  if (dup.status !== 400) throw new Error("Duplicate email check failed");

  // Step 3: User A Login & Authentication
  console.log(`[TEST 3] User A Login...`);
  const loginA = await request("POST", "/api/auth/login", {
    email: userAEmail,
    password: "Password123!",
  });
  console.log(`  - User A login: HTTP ${loginA.status} (JWT issued)`);
  if (loginA.status !== 200 || !loginA.body.token) throw new Error("User A login failed");
  const tokenA = loginA.body.token;

  // Step 4: Token Verification on /api/auth/me
  console.log(`[TEST 4] Verifying Profile & Session via /api/auth/me...`);
  const meRes = await request("GET", "/api/auth/me", null, tokenA);
  console.log(`  - Auth Me: Welcome ${meRes.body.user.fullName} (${meRes.body.user.email})`);
  if (meRes.status !== 200) throw new Error("Get Me failed");

  // Step 5: Profile Update
  console.log(`[TEST 5] Updating User A Profile Name...`);
  const updateProfile = await request("PUT", "/api/users/profile", { fullName: "Charlie Senior Engineer" }, tokenA);
  console.log(`  - Profile update: HTTP ${updateProfile.status} -> ${updateProfile.body.user.fullName}`);
  if (updateProfile.status !== 200) throw new Error("Update profile failed");

  // Step 6: Create Applications for User A
  console.log(`[TEST 6] User A Creating Job Applications...`);
  const app1 = await request("POST", "/api/applications", {
    companyName: "Amazon",
    position: "Senior Backend Engineer",
    appliedDate: "2026-03-01",
    status: "Interview",
    interviewDate: "2026-03-20",
    followUpDate: "2026-03-21",
    jobType: "Full-time",
    location: "Hyderabad",
    jobUrl: "https://amazon.jobs/en/jobs/12345",
    description: "AWS cloud services, DynamoDB, Node.js",
  }, tokenA);
  console.log(`  - Created App 1 (Amazon): ID #${app1.body.application.id}`);

  const app2 = await request("POST", "/api/applications", {
    companyName: "Netflix",
    position: "Full Stack Engineer",
    appliedDate: "2026-03-05",
    status: "Applied",
    followUpDate: "2026-03-25",
    jobType: "Remote",
    location: "Remote",
    description: "Microservices and React applications",
  }, tokenA);
  console.log(`  - Created App 2 (Netflix): ID #${app2.body.application.id}`);

  const app3 = await request("POST", "/api/applications", {
    companyName: "Meta",
    position: "Frontend Architect",
    appliedDate: "2026-02-15",
    status: "Offer",
    jobType: "Full-time",
    location: "Bengaluru",
  }, tokenA);
  console.log(`  - Created App 3 (Meta): ID #${app3.body.application.id}`);

  // Step 7: Search and Filter Applications
  console.log(`[TEST 7] Testing Search and Filter...`);
  const searchCompany = await request("GET", "/api/applications?search=Netflix", null, tokenA);
  console.log(`  - Search 'Netflix': found ${searchCompany.body.count} application(s)`);
  if (searchCompany.body.count !== 1) throw new Error("Search by company failed");

  const filterStatus = await request("GET", "/api/applications?status=Interview", null, tokenA);
  console.log(`  - Filter status='Interview': found ${filterStatus.body.count} application(s)`);
  if (filterStatus.body.count !== 1) throw new Error("Filter by status failed");

  // Step 8: Edit Application
  console.log(`[TEST 8] Editing Application #${app2.body.application.id} (Netflix)...`);
  const editApp = await request("PUT", `/api/applications/${app2.body.application.id}`, {
    companyName: "Netflix Inc.",
    position: "Lead Full Stack Engineer",
    appliedDate: "2026-03-05",
    status: "Interview",
    interviewDate: "2026-03-28",
  }, tokenA);
  console.log(`  - Application edited: Status=${editApp.body.application.status}, Position=${editApp.body.application.position}`);
  if (editApp.body.application.status !== "Interview") throw new Error("Edit application failed");

  // Step 9: Dashboard Metrics & Reminders
  console.log(`[TEST 9] Checking Dashboard Metrics...`);
  const dashStats = await request("GET", "/api/applications/dashboard-stats", null, tokenA);
  console.log(`  - Total: ${dashStats.body.stats.total}, Interviews: ${dashStats.body.stats.interview}, Offers: ${dashStats.body.stats.offer}`);
  console.log(`  - Reminders: ${dashStats.body.reminders.length} upcoming interview/follow-up items`);

  // Step 10: Interviews & Reminders API
  console.log(`[TEST 10] Checking Interviews & Follow-ups Page Data...`);
  const interviewsRes = await request("GET", "/api/applications/interviews", null, tokenA);
  console.log(`  - Interviews count: ${interviewsRes.body.interviews.length}, Follow-ups count: ${interviewsRes.body.followUps.length}`);

  // Step 11: Statistics API
  console.log(`[TEST 11] Checking Statistics & Chart Data...`);
  const statsRes = await request("GET", "/api/applications/statistics", null, tokenA);
  console.log(`  - Interview rate: ${statsRes.body.insights.interviewRate}%, Offer rate: ${statsRes.body.insights.offerRate}%`);
  console.log(`  - Monthly Timeline data points: ${statsRes.body.timelineData.length} months`);

  // Step 12: Data Isolation Test with User B
  console.log(`[TEST 12] Strict Data Isolation Verification (User B)...`);
  const userBEmail = `dana_${Date.now()}@example.com`;
  await request("POST", "/api/auth/register", {
    fullName: "Dana Data",
    email: userBEmail,
    password: "Password123!",
  });
  const loginB = await request("POST", "/api/auth/login", {
    email: userBEmail,
    password: "Password123!",
  });
  const tokenB = loginB.body.token;

  const userBApps = await request("GET", "/api/applications", null, tokenB);
  console.log(`  - User B sees: ${userBApps.body.count} applications (Expected 0)`);
  if (userBApps.body.count !== 0) throw new Error("DATA ISOLATION BREACH: User B sees User A apps!");

  // Attempting direct access to User A's app with User B token
  const illegalAccess = await request("GET", `/api/applications/${app1.body.application.id}`, null, tokenB);
  console.log(`  - Cross-user direct access attempt: HTTP ${illegalAccess.status} (Expected 404)`);
  if (illegalAccess.status !== 404) throw new Error("DATA ISOLATION BREACH: User B accessed User A application directly!");

  // Step 13: Delete Application
  console.log(`[TEST 13] Deleting Application #${app3.body.application.id} (Meta)...`);
  const delRes = await request("DELETE", `/api/applications/${app3.body.application.id}`, null, tokenA);
  console.log(`  - Delete status: HTTP ${delRes.status} (${delRes.body.message})`);
  if (delRes.status !== 200) throw new Error("Delete application failed");

  // Step 14: Admin Authentication & Access Control
  console.log(`[TEST 14] Admin Authentication & Access Control...`);
  // Normal user attempting to access Admin API
  const normalUserToAdmin = await request("GET", "/api/admin/stats", null, tokenA);
  console.log(`  - Normal user accessing Admin API: HTTP ${normalUserToAdmin.status} (Expected 403 Forbidden)`);
  if (normalUserToAdmin.status !== 403) throw new Error("RBAC BREACH: Normal user accessed admin route!");

  // Admin login with seeded credentials
  const adminLog = await request("POST", "/api/auth/admin-login", {
    email: "admin@jobtrack.com",
    password: "Admin@123456",
  });
  console.log(`  - Admin Login: HTTP ${adminLog.status} (Role: ${adminLog.body.user.role})`);
  if (adminLog.status !== 200 || adminLog.body.user.role !== "Admin") throw new Error("Admin login failed");
  const adminToken = adminLog.body.token;

  // Admin Stats
  const adminStats = await request("GET", "/api/admin/stats", null, adminToken);
  console.log(`  - Admin Global Stats: Total Users=${adminStats.body.stats.totalUsers}, Total Apps=${adminStats.body.stats.totalApplications}`);

  // Admin Users List & Search
  const adminUsers = await request("GET", "/api/admin/users?search=Charlie", null, adminToken);
  console.log(`  - Admin User Search ('Charlie'): Found ${adminUsers.body.users.length} match(es)`);
  if (adminUsers.body.users.length === 0) throw new Error("Admin search users failed");
  const charlieId = adminUsers.body.users[0].id;

  // Admin User Details
  const userDetails = await request("GET", `/api/admin/users/${charlieId}`, null, adminToken);
  console.log(`  - Admin View Details for User #${charlieId}: ${userDetails.body.user.fullName} has ${userDetails.body.user.applicationCount} applications`);

  // Admin Deactivate User
  console.log(`[TEST 15] Admin Account Deactivation & Activation...`);
  const deactRes = await request("PATCH", `/api/admin/users/${charlieId}/status`, { status: "inactive" }, adminToken);
  console.log(`  - Deactivated Charlie: HTTP ${deactRes.status} (${deactRes.body.message})`);

  // Charlie tries to login while deactivated
  const deactLogin = await request("POST", "/api/auth/login", {
    email: userAEmail,
    password: "Password123!",
  });
  console.log(`  - Deactivated user login attempt: HTTP ${deactLogin.status} (${deactLogin.body.message}) (Expected 403)`);
  if (deactLogin.status !== 403) throw new Error("Deactivated user was allowed to log in!");

  // Admin Reactivates Charlie
  const reactRes = await request("PATCH", `/api/admin/users/${charlieId}/status`, { status: "active" }, adminToken);
  console.log(`  - Reactivated Charlie: HTTP ${reactRes.status} (${reactRes.body.message})`);

  const reactLogin = await request("POST", "/api/auth/login", {
    email: userAEmail,
    password: "Password123!",
  });
  console.log(`  - Reactivated user login: HTTP ${reactLogin.status} (Success)`);
  if (reactLogin.status !== 200) throw new Error("Reactivated user login failed");

  console.log("\n========================================================");
  console.log("🎉 ALL 15 VERIFICATION TEST SUITES PASSED FLAWLESSLY!");
  console.log("========================================================\n");
}

module.exports = { runFullVerification };

if (require.main === module) {
  const { app, server } = require("./server");
  setTimeout(async () => {
    try {
      await runFullVerification();
    } catch (e) {
      console.error("Verification Error:", e);
      process.exitCode = 1;
    } finally {
      server.close();
      process.exit(process.exitCode || 0);
    }
  }, 1000);
}
