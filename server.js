import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

// ========================
// Employee Module Routes
// ========================
import empAuthRoutes from "./modules/employee/routes/auth.routes.js";
import empEmployeeRoutes from "./modules/employee/routes/employee.routes.js";

// ========================
// Admin Module Routes
// ========================
import adminAuthRoutes from "./modules/admin/routes/auth.routes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import adminDashboardRoutes from "./modules/admin/routes/adminDashboard.routes.js";
import hrRoutes from "./modules/admin/routes/hr.routes.js";
import hrDashboardRoutes from "./modules/admin/routes/hrDashboard.routes.js";
import departmentRoutes from "./modules/admin/routes/department.routes.js";
import payrollRoutes from "./modules/admin/routes/payroll.routes.js";
import leaveRoutes from "./modules/admin/routes/leave.routes.js";
import attendanceRoutes from "./modules/admin/routes/attendance.routes.js";
import internalRequestsRoutes from "./modules/admin/routes/internalRequests.routes.js";
import meetingRoutes from "./modules/admin/routes/meeting.routes.js";
import meetingAttendanceRoutes from "./modules/admin/routes/meetingAttendance.routes.js";
import projectRoutes from "./modules/admin/routes/project.routes.js";
import projectAssignmentRoutes from "./modules/admin/routes/projectAssignment.routes.js";
import { pool } from "./config/db.js";

// ========================
// Interview Module Routes (Migrated to Admin)
// ========================
import interviewAdminRoutes from "./modules/admin/routes/interview/adminRoutes.js";
import candidateRoutes from "./modules/admin/routes/interview/candidateRoutes.js";
import testRoutes from "./modules/admin/routes/interview/testRoutes.js";
import onboardingRoutes from "./modules/admin/routes/interview/onboardingRoutes.js";
import questionRoutes from "./modules/admin/routes/interview/questionRoutes.js";

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Helmet config
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ========================
// Employee Module Routes (prefixed with /api/emp)
// ========================
app.use("/api/emp/auth", empAuthRoutes);
app.use("/api/emp/employee", empEmployeeRoutes);

// ========================
// Admin Module Routes (unchanged prefixes)
// ========================
app.use("/api/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/hr/dashboard", hrDashboardRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/requests", internalRequestsRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/meeting-attendance", meetingAttendanceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/project-assignments", projectAssignmentRoutes);

// Admin debug routes (from original Admin BE server.js)
app.get('/api/debug/all-hr-users', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id as user_id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        hi.hr_id,
        hi.department_id,
        d.name as department_name,
        e.emp_id
      FROM users u
      LEFT JOIN hr_info hi ON u.id = hi.user_id
      LEFT JOIN departments d ON hi.department_id = d.dept_id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.role = 'HR' OR u.role = 'EMPLOYEE'
      ORDER BY u.role, u.username
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/leaves/test", (req, res) => {
  console.log("✅ Leaves test endpoint working");
  res.json({ message: "Leaves endpoint is working!", timestamp: new Date().toISOString() });
});

// ========================
// Interview Module Routes (prefixed with /api/interview)
// ========================
app.use("/api/interview/admin", interviewAdminRoutes);
app.use("/api/interview/candidate", candidateRoutes);
app.use("/api/interview/tests", testRoutes);
app.use("/api/interview/onboarding", onboardingRoutes);
app.use("/api/interview/questions", questionRoutes);

// Root health check
app.get("/", (req, res) => {
  res.send("✅ Unified Backend running successfully! Modules: Employee, Admin (including Interview)");
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Test DB connection
(async () => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    console.log("✅ Database Connected — Current Time:", rows[0].time);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Unified Server running on port ${PORT}`);
  console.log(`  📦 Employee module: /api/emp/*`);
  console.log(`  📦 Admin module:    /api/auth/*, /api/admin/*, /api/hr/*, /api/interview/*`);
});
