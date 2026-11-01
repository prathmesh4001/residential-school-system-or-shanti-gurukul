/* ============================================================
   Auth Middleware — JWT Token Verification
   ============================================================ */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shanti-gurukul-secret-2024';

/* ── Role-based Access Control ── */
const MODULE_ACCESS = {
  teacher: ['dashboard','attendance','results','timetable','students','staff','notices','achievements','medical','expenses','mess','teacher-leave','mentor','parent'],
  mentor:  ['dashboard','mentor','attendance','hostel','students','staff','achievements','medical','expenses','mess','teacher-leave','notices','parent'],
  warden:  ['dashboard','mentor','attendance','hostel','students','staff','achievements','medical','expenses','mess','teacher-leave','notices','parent'],
  parent:  ['parent'],
  admin:      null, // null = all access
  principal:  null, // null = all access
};

const MODULE_WRITE = {
  principal: ['notices','results','timetable','attendance','achievements','medical','expenses','mess','teacher-leave','mentor','parent'],
  teacher:   ['attendance','results','achievements','medical','expenses','teacher-leave','mentor'],
  mentor:    ['mentor','attendance','medical','expenses','mess','teacher-leave','hostel'],
  warden:    ['mentor','attendance','medical','expenses','mess','teacher-leave','hostel'],
  parent:    ['parent'],
  admin:     null,
};

/**
 * Verify JWT token from Authorization header
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — no token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { username, role, name }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
  }
}

/**
 * Check if user can access a module
 */
export function canAccess(module) {
  return (req, res, next) => {
    const { role } = req.user;
    if (!role) return res.status(403).json({ error: 'Forbidden' });

    const allowed = MODULE_ACCESS[role];
    if (allowed === null) return next(); // admin/principal = full access

    if (!allowed.includes(module)) {
      return res.status(403).json({ error: `Forbidden — ${role} cannot access ${module}` });
    }
    next();
  };
}

/**
 * Check if user can write to a module
 */
export function canWrite(module) {
  return (req, res, next) => {
    const { role } = req.user;
    const allowed = MODULE_WRITE[role];
    if (allowed === null) return next(); // admin = full write

    if (!allowed || !allowed.includes(module)) {
      return res.status(403).json({ error: `Forbidden — ${role} cannot write to ${module}` });
    }
    next();
  };
}

export const JWT_SECRET_KEY = JWT_SECRET;
