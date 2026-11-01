import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);

const getDashboardData = (_req, res) => {
  const allStaff = DB.staff.getAll();
  const teachersCount = allStaff.filter(s => s.role === 'teacher').length;

  // Dashboard stats matching Shanti Gurukul specification (120 students, 60 residential boys, 60 day scholar girls, 11 working teachers, 4 residential mentors)
  const dashboardStats = {
    students: {
      total: 120,
      boys: 60,
      girls: 60,
      residential: 60,
      day: 60,
      growth: '+6 this term',
      boysPct: 50,
      girlsPct: 50,
      residentialPct: 50,
      dayPct: 50,
    },
    staff: {
      teachers: teachersCount || 11,
      teachersGrowth: `${teachersCount || 11} Working Faculty`,
      mentors: 4,
      mentorsSub: '4 Boys Wings (15 Rooms)',
      peons: allStaff.filter(s => s.role === 'peon').length || 2,
      peonsSub: '2 Campus Support Staff',
      hostelRooms: 15,
      roomsSub: 'Rooms 201–215 (Boys)',
    },
    classWiseStrength: [
      { standard: 'Std 5', boys: 10, girls: 10, total: 20 },
      { standard: 'Std 6', boys: 10, girls: 10, total: 20 },
      { standard: 'Std 7', boys: 10, girls: 10, total: 20 },
      { standard: 'Std 8', boys: 10, girls: 10, total: 20 },
      { standard: 'Std 9', boys: 10, girls: 10, total: 20 },
      { standard: 'Std 10', boys: 10, girls: 10, total: 20 },
    ],
    attendanceToday: {
      percentage: 95,
      present: 114,
      total: 120,
      absent: 5,
      onLeave: 1,
    },
    hostelOccupancy: {
      boys: { occupied: 15, total: 15, pct: 100 },
      boysBoarders: { occupied: 60, total: 60, pct: 100 },
    },
    notices: [
      { id: 'N-101', title: 'Unit Test Schedule (Std 5 – 10)', category: 'Academic', date: '24 Sep 2026', icon: 'test' },
      { id: 'N-102', title: 'Gandhi Jayanti Holiday', category: 'Holiday', date: '22 Sep 2026', icon: 'holiday' },
      { id: 'N-103', title: 'Hostel Parent Meeting', category: 'Hostel', date: '20 Sep 2026', icon: 'meeting' },
      { id: 'N-104', title: 'Sports Day Selection', category: 'Sports', date: '18 Sep 2026', icon: 'sports' },
      { id: 'N-105', title: 'Mess Menu Update', category: 'Mess', date: '17 Sep 2026', icon: 'mess' },
    ],
    fees: { defaulters: 14 },
    achievements: DB.achievements.getAll().slice(0, 5),
  };

  res.json(dashboardStats);
};

router.get('/', getDashboardData);
router.get('/stats', getDashboardData);

export default router;
