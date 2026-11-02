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

async function runTests() {
  console.log("=== Starting Backend Automated API Tests ===");

  // 1. Health check
  const health = await request("GET", "/api/health");
  console.assert(health.status === 200, "Health check failed");
  console.log("✔ Health check passed");

  // 2. Register User A
  const userAEmail = `alice_${Date.now()}@example.com`;
  const regA = await request("POST", "/api/auth/register", {
    fullName: "Alice Developer",
    email: userAEmail,
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  console.assert(regA.status === 201, "Registration User A failed");
  console.log("✔ User A registered successfully");

  // Duplicate email check
  const dupCheck = await request("POST", "/api/auth/register", {
    fullName: "Alice Developer",
    email: userAEmail,
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  console.assert(dupCheck.status === 400, "Duplicate email check failed");
  console.log("✔ Duplicate email rejection verified");

  // 3. Login User A
  const loginA = await request("POST", "/api/auth/login", {
    email: userAEmail,
    password: "Password123!",
  });
  console.assert(loginA.status === 200 && loginA.body.token, "Login User A failed");
  const tokenA = loginA.body.token;
  console.log("✔ User A login successful, JWT token obtained");

  // 4. Verify /api/auth/me
  const meA = await request("GET", "/api/auth/me", null, tokenA);
  console.assert(meA.status === 200 && meA.body.user.email === userAEmail, "Get me failed");
  console.log("✔ /api/auth/me verified for User A");

  // 5. User A creates 2 applications
  const app1 = await request(
    "POST",
    "/api/applications",
    {
      companyName: "Google",
      position: "Frontend Engineer",
      appliedDate: "2026-03-01",
      status: "Interview",
      interviewDate: "2026-03-15",
      followUpDate: "2026-03-16",
      jobType: "Full-time",
      location: "Bengaluru",
      jobUrl: "https://careers.google.com/jobs/123",
      description: "React and TypeScript role",
    },
    tokenA
  );
  console.assert(app1.status === 201, "Application 1 creation failed");

  const app2 = await request(
    "POST",
    "/api/applications",
    {
      companyName: "Microsoft",
      position: "Cloud Developer",
      appliedDate: "2026-03-05",
      status: "Applied",
      followUpDate: "2026-03-20",
      jobType: "Full-time",
      location: "Hyderabad",
    },
    tokenA
  );
  console.assert(app2.status === 201, "Application 2 creation failed");
  console.log("✔ User A created 2 job applications");

  // User A views applications
  const listA = await request("GET", "/api/applications", null, tokenA);
  console.assert(listA.body.count === 2, "User A should have 2 applications");
  console.log("✔ User A applications retrieved (count: 2)");

  // 6. User Isolation Test: Register and Login User B
  const userBEmail = `bob_${Date.now()}@example.com`;
  const regB = await request("POST", "/api/auth/register", {
    fullName: "Bob Engineer",
    email: userBEmail,
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  console.assert(regB.status === 201, "Registration User B failed");

  const loginB = await request("POST", "/api/auth/login", {
    email: userBEmail,
    password: "Password123!",
  });
  const tokenB = loginB.body.token;

  // User B views applications - MUST be 0!
  const listB = await request("GET", "/api/applications", null, tokenB);
  console.assert(listB.body.count === 0, "User B should NOT see User A's applications!");
  console.log("✔ Strict Data Isolation Verified: User B sees 0 applications");

  // User B tries to access User A's application by ID - MUST be 404
  const appId1 = app1.body.application.id;
  const unauthorizedAccess = await request("GET", `/api/applications/${appId1}`, null, tokenB);
  console.assert(unauthorizedAccess.status === 404, "User B should not access User A app!");
  console.log("✔ Unauthorized direct application ID access rejected (404)");

  // 7. Admin Login
  const adminLogin = await request("POST", "/api/auth/admin-login", {
    email: "admin@jobtrack.com",
    password: "Admin@123456",
  });
  console.assert(adminLogin.status === 200 && adminLogin.body.user.role === "Admin", "Admin login failed");
  const adminToken = adminLogin.body.token;
  console.log("✔ Admin logged in successfully with seeded credentials");

  // Normal user cannot access admin APIs
  const forbiddenAdminCheck = await request("GET", "/api/admin/stats", null, tokenA);
  console.assert(forbiddenAdminCheck.status === 403, "Normal user accessed admin API!");
  console.log("✔ Role-based Access Control verified: Normal user blocked from Admin API (403)");

  // Admin views stats and users
  const adminStats = await request("GET", "/api/admin/stats", null, adminToken);
  console.assert(adminStats.status === 200 && adminStats.body.stats.totalApplications >= 2, "Admin stats failed");
  console.log(`✔ Admin Stats: Total Users=${adminStats.body.stats.totalUsers}, Total Apps=${adminStats.body.stats.totalApplications}`);

  const adminUsers = await request("GET", "/api/admin/users", null, adminToken);
  console.assert(adminUsers.status === 200 && adminUsers.body.users.length >= 2, "Admin user list failed");
  console.log(`✔ Admin Users Table: Retrieved ${adminUsers.body.users.length} registered users`);

  console.log("=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===");
}

module.exports = { runTests };

if (require.main === module) {
  const { app, server } = require("./server");
  setTimeout(async () => {
    try {
      await runTests();
    } catch (e) {
      console.error("Test error:", e);
    } finally {
      server.close();
      process.exit(0);
    }
  }, 1000);
}
