/* ============================================================
   Timetable Routes — Scheduling, Conflict Prevention & Personal Teacher Dashboard
   Shanti Gurukul School Management System
   ============================================================ */

import express from 'express';
import { authenticate, canAccess, canWrite } from '../middleware/auth.js';
import { DB } from '../data/store.js';
import {
  generateFullSchoolTimetable,
  validateTimetableConflicts,
  DEFAULT_SCHEDULE_CONFIG
} from '../services/timetableScheduler.js';

const router = express.Router();

router.use(authenticate);

/* ── 1. Get Timetable Configuration ── */
router.get('/config', (req, res) => {
  res.json(DB.timetable.getConfig());
});

/* ── 2. Update Timetable Configuration (Admin/Principal only) ── */
router.put('/config', canWrite('timetable'), (req, res) => {
  const updated = DB.timetable.updateConfig(req.body);
  res.json({ message: 'Configuration updated successfully', config: updated });
});

/* ── 3. Get Published Timetable (Full School or by Class) ── */
router.get('/published', (req, res) => {
  const published = DB.timetable.getPublished();
  res.json(published || { status: 'none', classes: {} });
});

/* ── 4. Get Working Draft (Admin/Principal only) ── */
router.get('/draft', canWrite('timetable'), (req, res) => {
  const draft = DB.timetable.getDraft();
  res.json(draft || { status: 'none', classes: {} });
});

/* ── 5. Generate Full School Conflict-Free Timetable (Admin/Principal only) ── */
router.post('/generate', canWrite('timetable'), (req, res) => {
  const config = DB.timetable.getConfig();
  const staff = DB.staff.getAll();
  const draft = generateFullSchoolTimetable(config, staff);
  DB.timetable.saveDraft(draft);
  res.json({
    message: 'Conflict-free timetable draft generated successfully',
    draft,
    validation: draft.validation
  });
});

/* ── 6. Validate Timetable for Conflicts ── */
router.post('/validate', (req, res) => {
  const timetable = req.body.classes || req.body;
  const config = DB.timetable.getConfig();
  const report = validateTimetableConflicts(timetable, config);
  res.json(report);
});

/* ── 7. Update Period Entry in Draft (with immediate Conflict Detection) ── */
router.put('/draft/entry', canWrite('timetable'), (req, res) => {
  const { classKey, day, periodNumber, subject, teacherId, teacherName, room } = req.body;
  if (!classKey || !day || periodNumber === undefined) {
    return res.status(400).json({ error: 'classKey, day, and periodNumber are required' });
  }

  const draft = DB.timetable.getDraft();
  if (!draft || !draft.classes || !draft.classes[classKey]) {
    return res.status(404).json({ error: 'Timetable class not found' });
  }

  const daySlots = draft.classes[classKey][day];
  if (!daySlots) {
    return res.status(404).json({ error: `Day ${day} not found in timetable` });
  }

  const slotIndex = daySlots.findIndex(s => s.periodNumber === Number(periodNumber));
  if (slotIndex === -1) {
    return res.status(404).json({ error: `Period ${periodNumber} not found on ${day}` });
  }

  // Clone draft to test proposed change
  const draftClone = JSON.parse(JSON.stringify(draft.classes));
  draftClone[classKey][day][slotIndex] = {
    ...draftClone[classKey][day][slotIndex],
    subject: subject || '—',
    teacherId: teacherId || '',
    teacherName: teacherName || '',
    room: room || draftClone[classKey][day][slotIndex].room || 'Room'
  };

  const validation = validateTimetableConflicts(draftClone, DB.timetable.getConfig());

  // If there are strict conflicts, reject unless forced by admin with warning
  if (!validation.valid && req.body.preventConflict !== false) {
    return res.status(409).json({
      error: 'Cannot update: conflict detected',
      conflicts: validation.conflicts,
      validation
    });
  }

  // Apply change to actual draft
  draft.classes[classKey][day][slotIndex] = draftClone[classKey][day][slotIndex];
  draft.validation = validation;
  DB.timetable.saveDraft(draft);

  res.json({
    message: 'Slot updated successfully',
    slot: draft.classes[classKey][day][slotIndex],
    validation
  });
});

/* ── 8. Publish Timetable (Admin/Principal only) ── */
router.post('/publish', canWrite('timetable'), (req, res) => {
  const draft = DB.timetable.getDraft();
  if (!draft || !draft.classes) {
    return res.status(400).json({ error: 'No timetable draft to publish' });
  }

  const validation = validateTimetableConflicts(draft.classes, DB.timetable.getConfig());
  if (!validation.valid) {
    return res.status(409).json({
      error: 'Cannot publish: timetable has unresolved conflicts',
      conflicts: validation.conflicts,
      validation
    });
  }

  const published = DB.timetable.publish(draft);
  res.json({
    message: 'Timetable published successfully. All teachers and classes can now view it.',
    published
  });
});

/* ── 9. Teacher's Personal Timetable (Strictly Authenticated) ── */
router.get('/my-schedule', (req, res) => {
  const { role, staffId, name } = req.user;
  if (role !== 'teacher' && role !== 'admin' && role !== 'principal') {
    return res.status(403).json({ error: 'Only teachers can access personal schedule' });
  }

  // Find corresponding teacher staff record
  const allStaff = DB.staff.getAll();
  const staff = allStaff.find(s =>
    (staffId && s.id === staffId) ||
    (s.name && name && s.name.toLowerCase() === name.toLowerCase())
  ) || { id: staffId || 'ST-001', name: name || 'Teacher', subject: 'Teaching', classTeacherOf: '' };

  const targetId = staff.id;
  const targetName = staff.name;

  // Retrieve published schedule for this teacher
  const teacherGrid = DB.timetable.getTeacherSchedule(targetId, false);

  // Compute workload statistics
  let totalTeachingPeriods = 0;
  let freePeriods = 0;
  const classesTaughtSet = new Set();
  const subjectListSet = new Set();

  Object.values(teacherGrid).forEach(slots => {
    slots.forEach(s => {
      if (!s.isBreak) {
        if (s.isFree) {
          freePeriods++;
        } else {
          totalTeachingPeriods++;
          if (s.classKey) classesTaughtSet.add(s.classKey.replace('_', '-'));
          if (s.subject) subjectListSet.add(s.subject);
        }
      }
    });
  });

  // Today's schedule calculation
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()] || 'Monday';
  const todaySlots = teacherGrid[todayName] || teacherGrid['Monday'] || [];

  res.json({
    teacher: {
      staffId: staff.id,
      name: staff.name,
      subject: staff.subject || Array.from(subjectListSet).join(', '),
      classTeacherOf: staff.classTeacherOf || '—',
      email: staff.email || '',
      phone: staff.phone || ''
    },
    today: todayName,
    todaySchedule: todaySlots,
    weeklySchedule: teacherGrid,
    stats: {
      weeklyPeriods: totalTeachingPeriods,
      freePeriods,
      classesTaught: Array.from(classesTaughtSet),
      subjects: Array.from(subjectListSet)
    }
  });
});

/* ── 10. Teacher-wise Timetable (Admin view for any teacher) ── */
router.get('/teacher/:teacherId', (req, res) => {
  const isDraft = req.query.draft === 'true';
  const grid = DB.timetable.getTeacherSchedule(req.params.teacherId, isDraft);
  const staff = DB.staff.getById(req.params.teacherId);
  res.json({ teacher: staff || { id: req.params.teacherId }, schedule: grid });
});

/* ── 11. Class-wise Timetable ── */
router.get('/class/:cls/:section', (req, res) => {
  const isDraft = req.query.draft === 'true';
  const schedule = DB.timetable.get(req.params.cls, req.params.section, isDraft);
  res.json(schedule);
});

/* ── 12. Legacy Route Compatibility ── */
router.get('/:cls/:section', (req, res) => {
  const isDraft = req.query.draft === 'true';
  res.json(DB.timetable.get(req.params.cls, req.params.section, isDraft));
});

router.get('/:clsKey', (req, res) => {
  const parts = req.params.clsKey.split(/[_-]/);
  const cls = parts[0];
  const section = parts[1] || 'A';
  res.json(DB.timetable.get(cls, section));
});

router.put('/:cls/:section', canWrite('timetable'), (req, res) => {
  DB.timetable.save(req.params.cls, req.params.section, req.body);
  res.json({ message: 'Saved' });
});

export default router;
