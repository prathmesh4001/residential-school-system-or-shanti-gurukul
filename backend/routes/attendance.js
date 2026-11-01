import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('attendance'));

// GET /api/attendance (Single period or daily sheet)
router.get('/', (req, res) => {
  const { cls, section, date, period, type } = req.query;
  const p = period || type || 'all';
  if (cls && section && date) {
    const record = DB.attendance.get(cls, section, date, p);
    return res.json(record || {});
  }
  res.json([]);
});

// GET /api/attendance/day (Full daily diary across all periods)
router.get('/day', (req, res) => {
  const { date, cls, section = 'A' } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });
  const dayData = DB.attendance.getDayRegister(date, cls, section);
  res.json(dayData);
});

// GET /api/attendance/monthly-report (Subject-wise monthly report)
router.get('/monthly-report', (req, res) => {
  const { month, year, cls, section = 'A' } = req.query;
  const m = month ? parseInt(month) : new Date().getMonth() + 1;
  const y = year ? parseInt(year) : new Date().getFullYear();
  const c = cls || '10';
  const report = DB.attendance.getMonthlyReport(m, y, c, section);
  res.json(report);
});

router.get('/stats', (req, res) => {
  const { month, year, cls } = req.query;
  const m = month ? parseInt(month) : null;
  const y = year ? parseInt(year) : null;
  let students = DB.students.getAll();
  if (cls) {
    students = students.filter(s => s.class == cls);
  }
  const result = students.map(s => {
    const days = DB.attendance.calcDays(s.id, m, y);
    const pct = days.total > 0 ? Math.round((days.present / days.total) * 100) : DB.attendance.calcPercent(s.id);
    return {
      student: s,
      days,
      percentage: pct
    };
  });
  res.json(result);
});

router.get('/student/:id', (req, res) => {
  const { month, year } = req.query;
  res.json(DB.attendance.getStudentRecord(req.params.id, month, year));
});

router.get('/student/:id/percent', (req, res) => {
  res.json({ percentage: DB.attendance.calcPercent(req.params.id) });
});

router.post('/', (req, res) => {
  const { cls, section, date, period, subject, teacher, type, records } = req.body;
  const saved = DB.attendance.save(cls, section, date, type || 'class', records, { period, subject, teacher });
  res.json({ message: 'Attendance saved', record: saved });
});

export default router;
