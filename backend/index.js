/* ============================================================
   SHANTI GURUKUL, BACHANI — Backend Server
   index.js : Express entry point
   ============================================================ */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route imports (will be added as modules are built)
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import staffRoutes from './routes/staff.js';
import attendanceRoutes from './routes/attendance.js';
import feesRoutes from './routes/fees.js';
import resultsRoutes from './routes/results.js';
import hostelRoutes from './routes/hostel.js';
import medicalRoutes from './routes/medical.js';
import mentorRoutes from './routes/mentor.js';
import messRoutes from './routes/mess.js';
import achievementsRoutes from './routes/achievements.js';
import sportsRoutes from './routes/sports.js';
import noticesRoutes from './routes/notices.js';
import expensesRoutes from './routes/expenses.js';
import teacherLeaveRoutes from './routes/teacherLeave.js';
import timetableRoutes from './routes/timetable.js';
import parentRoutes from './routes/parent.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ── */
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/* ── Health Check ── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Shanti Gurukul API is running', timestamp: new Date().toISOString() });
});

/* ── API Routes ── */
app.use('/api/auth',          authRoutes);
app.use('/api/students',      studentsRoutes);
app.use('/api/staff',         staffRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/fees',          feesRoutes);
app.use('/api/results',       resultsRoutes);
app.use('/api/hostel',        hostelRoutes);
app.use('/api/medical',       medicalRoutes);
app.use('/api/mentor',        mentorRoutes);
app.use('/api/mess',          messRoutes);
app.use('/api/achievements',  achievementsRoutes);
app.use('/api/sports',        sportsRoutes);
app.use('/api/notices',       noticesRoutes);
app.use('/api/expenses',      expensesRoutes);
app.use('/api/teacher-leave', teacherLeaveRoutes);
app.use('/api/timetable',     timetableRoutes);
app.use('/api/parent',        parentRoutes);
app.use('/api/dashboard',     dashboardRoutes);

/* ── 404 Handler ── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ── Global Error Handler ── */
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

/* ── Start Server ── */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🏫  Shanti Gurukul API running at http://localhost:${PORT}`);
    console.log(`📋  Health check: http://localhost:${PORT}/api/health\n`);
  });
});

export default app;
