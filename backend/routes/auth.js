/* ── Auth Route ── */
import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, JWT_SECRET_KEY } from '../middleware/auth.js';
import { DB } from '../data/store.js';

const router = express.Router();

/* Hardcoded users matching legacy app.js & seed data */
const USERS = {
  admin:                 { passwords: ['gurukul@2024', 'admin123', 'admin'],  role: 'admin',     name: 'Administrator' },
  'admin@gmail.com':     { passwords: ['gurukul@2024', 'admin123', 'admin'],  role: 'admin',     name: 'Administrator' },
  principal:             { passwords: ['principal@123', 'admin123'],          role: 'principal',  name: 'Dr. Ramesh Pawar' },
  'principal@gmail.com': { passwords: ['principal@123', 'admin123'],          role: 'principal',  name: 'Dr. Ramesh Pawar' },
  teacher:               { passwords: ['teacher@123', 'teacher123'],          role: 'teacher',   name: 'Mr. Ramesh Gupta', staffId: 'ST-001', subject: 'Mathematics', classTeacherOf: '10-A' },
  teacher1:              { passwords: ['teacher@123', 'teacher123'],          role: 'teacher',   name: 'Mr. Ramesh Gupta', staffId: 'ST-001', subject: 'Mathematics', classTeacherOf: '10-A' },
  'teacher@gmail.com':   { passwords: ['teacher@123', 'teacher123'],          role: 'teacher',   name: 'Mr. Ramesh Gupta', staffId: 'ST-001', subject: 'Mathematics', classTeacherOf: '10-A' },
  mentor:                { passwords: ['mentor@123', 'mentor123', 'gurukul@2024'], role: 'mentor', name: 'Mr. Sanjay Bhosale (Residential Mentor)', mentorId: 'MEN-01', wing: 'Junior Boys Wing A (Rooms 201-204)' },
  'mentor@gmail.com':    { passwords: ['mentor@123', 'mentor123', 'gurukul@2024'], role: 'mentor', name: 'Mr. Sanjay Bhosale (Residential Mentor)', mentorId: 'MEN-01', wing: 'Junior Boys Wing A (Rooms 201-204)' },
  'mentor1@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Sanjay Bhosale (Residential Mentor)', mentorId: 'MEN-01', wing: 'Junior Boys Wing A (Rooms 201-204)' },
  'mentor2@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Ramesh Shinde (Residential Mentor)', mentorId: 'MEN-02', wing: 'Junior Boys Wing B (Rooms 205-208)' },
  'mentor3@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Suresh Jadhav (Residential Mentor)', mentorId: 'MEN-03', wing: 'Middle Boys Wing (Rooms 209-212)' },
  'mentor4@gmail.com':   { passwords: ['mentor@123', 'mentor123'], role: 'mentor', name: 'Mr. Deepak Kadam (Residential Mentor)', mentorId: 'MEN-04', wing: 'Senior Boys Wing (Rooms 213-215)' },
  warden:                { passwords: ['warden@123', 'teacher123', 'mentor@123'], role: 'mentor', name: 'Mr. Sanjay Bhosale (Residential Mentor)', mentorId: 'MEN-01', wing: 'Junior Boys Wing A' },
  parent:                { passwords: ['parent@123', 'parent123'],            role: 'parent',    name: 'Mr. Rajesh Sharma' },
  parent1:               { passwords: ['parent@123', 'parent123'],            role: 'parent',    name: 'Mr. Rajesh Sharma' },
  'parent@gmail.com':    { passwords: ['parent@123', 'parent123'],            role: 'parent',    name: 'Mr. Rajesh Sharma' },
};

const TEACHER_DEFAULT_PASSWORDS = ['teacher@123', 'teacher123', 'gurukul@2024', 'admin123', 'password123'];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const u = username.toLowerCase().trim();
  let user = USERS[u];
  let payload = null;

  if (user && (user.passwords.includes(password) || user.pass === password)) {
    payload = {
      username: u,
      role: user.role,
      name: user.name,
      staffId: user.staffId || user.mentorId || '',
      mentorId: user.mentorId || '',
      wing: user.wing || '',
      subject: user.subject || '',
      classTeacherOf: user.classTeacherOf || ''
    };
  } else {
    // Dynamic teacher lookup in staff store
    const allStaff = DB.staff.getAll();
    const staffMatch = allStaff.find(s => {
      const emailUser = s.email ? s.email.split('@')[0].toLowerCase() : '';
      const emailFull = s.email ? s.email.toLowerCase() : '';
      const idMatch   = s.id ? s.id.toLowerCase() : '';
      const nameMatch = s.name ? s.name.toLowerCase().replace(/mr\.|mrs\.|ms\./g, '').trim() : '';
      return u === idMatch || u === emailFull || u === emailUser || nameMatch.includes(u);
    });

    if (staffMatch && TEACHER_DEFAULT_PASSWORDS.includes(password)) {
      payload = {
        username: staffMatch.email ? staffMatch.email.split('@')[0] : staffMatch.id.toLowerCase(),
        role: staffMatch.role || 'teacher',
        name: staffMatch.name,
        staffId: staffMatch.id,
        email: staffMatch.email,
        subject: staffMatch.subject,
        classTeacherOf: staffMatch.classTeacherOf || ''
      };
    }

    // Dynamic parent lookup by student rollNo or parentPhone
    if (!payload) {
      const allStudents = DB.students.getAll();
      const stuMatch = allStudents.find(s => {
        const sid = s.id ? s.id.toLowerCase() : '';
        const sroll = s.rollNo ? s.rollNo.toLowerCase() : '';
        const sphone = s.parentPhone ? s.parentPhone.replace(/\D/g, '') : (s.contact ? s.contact.replace(/\D/g, '') : '');
        const cleanU = u.replace(/\D/g, '');
        return u === sid || u === sroll || (cleanU && cleanU.length >= 10 && sphone === cleanU);
      });
      if (stuMatch && ['parent@123', 'parent123', 'admin123', 'gurukul@2024', 'password123'].includes(password)) {
        payload = {
          username: stuMatch.id.toLowerCase(),
          role: 'parent',
          name: stuMatch.parentName || `Parent of ${stuMatch.name}`,
          studentId: stuMatch.id,
          studentName: stuMatch.name,
          studentClass: stuMatch.class,
          studentSection: stuMatch.section || 'A'
        };
      }
    }
  }

  if (!payload) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '8h' });
  res.json({ token, user: payload });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout  (stateless JWT — client just discards token)
router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
