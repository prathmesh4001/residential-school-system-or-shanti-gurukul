/* ============================================================
   Teacher Leave & Smart Substitution Route
   Shanti Gurukul School Management System
   ============================================================ */

import express from 'express';
import { authenticate, canAccess, canWrite } from '../middleware/auth.js';
import { DB } from '../data/store.js';

const router = express.Router();

router.use(authenticate);
router.use(canAccess('teacher-leave'));

/* ── 1. Smart Lookup: Absent Teacher's Scheduled Periods & Free Substitute Teachers ── */
router.get('/lookup-schedule', (req, res) => {
  const { staffId, date } = req.query;
  if (!staffId) return res.status(400).json({ error: 'staffId is required' });

  // Determine day of week
  let dayName = 'Monday';
  if (date) {
    const d = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!isNaN(d.getTime())) dayName = dayNames[d.getDay()];
  }
  if (dayName === 'Sunday') dayName = 'Monday';

  const published = DB.timetable.getPublished();
  const config = DB.timetable.getConfig();
  const allStaff = DB.staff.getAll();
  const teachers = allStaff.filter(s => s.role === 'teacher');

  const absentStaff = allStaff.find(s => s.id === staffId || s.name?.toLowerCase() === staffId.toLowerCase());
  const targetId = absentStaff ? absentStaff.id : staffId;
  const targetName = absentStaff ? absentStaff.name : staffId;

  // Find all teaching periods of the absent teacher on this day
  const teachingPeriods = config.periods.filter(p => !p.isBreak);
  const absentPeriods = [];

  teachingPeriods.forEach(p => {
    let classSlot = null;
    let foundClassKey = null;

    Object.entries(published.classes || {}).forEach(([classKey, dayMap]) => {
      const slot = (dayMap[dayName] || []).find(s => s.periodNumber === p.periodNumber);
      if (slot && (
        (slot.teacherId && slot.teacherId === targetId) ||
        (slot.teacherName && slot.teacherName.toLowerCase() === targetName.toLowerCase())
      )) {
        classSlot = slot;
        foundClassKey = classKey;
      }
    });

    if (classSlot) {
      // Find busy teachers in other classes during this exact period
      const busyTeacherMap = new Map();

      Object.entries(published.classes || {}).forEach(([cKey, dayMap]) => {
        const otherSlot = (dayMap[dayName] || []).find(s => s.periodNumber === p.periodNumber);
        if (otherSlot && otherSlot.teacherId && otherSlot.teacherId !== targetId) {
          busyTeacherMap.set(otherSlot.teacherId, {
            classKey: cKey.replace('_', '-'),
            subject: otherSlot.subject
          });
        }
      });

      const freeTeachers = [];
      const busyTeachers = [];

      teachers.forEach(t => {
        if (t.id === targetId) return; // skip absent teacher
        const busyInfo = busyTeacherMap.get(t.id);
        if (busyInfo) {
          busyTeachers.push({
            id: t.id,
            name: t.name,
            subject: t.subject,
            busyWith: `Class ${busyInfo.classKey} (${busyInfo.subject})`
          });
        } else {
          freeTeachers.push({
            id: t.id,
            name: t.name,
            subject: t.subject
          });
        }
      });

      absentPeriods.push({
        periodNumber: p.periodNumber,
        label: p.label,
        startTime: p.startTime,
        endTime: p.endTime,
        duration: p.duration,
        classKey: foundClassKey,
        classLabel: `Class ${foundClassKey.replace('_', '-')}`,
        subject: classSlot.subject,
        room: classSlot.room,
        freeTeachers,
        busyTeachers
      });
    }
  });

  res.json({
    staffId: targetId,
    staffName: targetName,
    date: date || new Date().toISOString().slice(0, 10),
    day: dayName,
    scheduledPeriodsCount: absentPeriods.length,
    periods: absentPeriods
  });
});

/* ── 2. Get All Leave Applications ── */
router.get('/', (_req, res) => {
  res.json(DB.teacherLeave.getAll());
});

/* ── 3. Apply for Leave ── */
router.post('/', (req, res) => {
  res.status(201).json(DB.teacherLeave.save({ ...req.body, appliedBy: req.user.username }));
});

/* ── 4. Update / Approve Leave / Save Substitutions ── */
router.put('/:id', (req, res) => {
  res.json(DB.teacherLeave.save({ ...req.body, id: req.params.id }));
});

/* ── 5. Delete Leave Application ── */
router.delete('/:id', (req, res) => {
  DB.teacherLeave.delete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
