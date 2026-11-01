/* ============================================================
   Timetable Scheduler & Constraint Validation Engine
   Shanti Gurukul School Management System
   ============================================================ */

/**
 * Convert time string (e.g. "10:00 AM", "01:30 PM", "10:40") to minutes from midnight
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const str = timeStr.trim();
  const isPM = /pm/i.test(str);
  const isAM = /am/i.test(str);
  const clean = str.replace(/[ap]m/i, '').trim();
  const parts = clean.split(':').map(Number);
  let hours = parts[0] || 0;
  const minutes = parts[1] || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Format minutes from midnight to "hh:mm AM/PM"
 */
export function minutesToTime(mins) {
  let hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/**
 * Check if two time intervals overlap: [s1, e1] and [s2, e2]
 */
export function intervalsOverlap(start1, end1, start2, end2) {
  const s1 = typeof start1 === 'number' ? start1 : timeToMinutes(start1);
  const e1 = typeof end1 === 'number' ? end1 : timeToMinutes(end1);
  const s2 = typeof start2 === 'number' ? start2 : timeToMinutes(start2);
  const e2 = typeof end2 === 'number' ? end2 : timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Standard School Timings (10:00 AM to 5:00 PM)
 * 9 Teaching Periods + 3 Recesses:
 * - Period 1: 10:00 AM – 10:40 AM (40m)
 * - Period 2: 10:40 AM – 11:20 AM (40m)
 * - 🍵 Short Recess: 11:20 AM – 11:35 AM (15m)
 * - Period 3: 11:35 AM – 12:15 PM (40m)
 * - Period 4: 12:15 PM – 12:55 PM (40m)
 * - 🍱 Lunch Recess: 12:55 PM – 1:30 PM (35m)
 * - Period 5: 1:30 PM – 2:10 PM (40m)
 * - Period 6: 2:10 PM – 2:50 PM (40m)
 * - Period 7: 2:50 PM – 3:30 PM (40m)
 * - 🍵 Afternoon Short Recess: 3:30 PM – 3:40 PM (10m)
 * - Period 8: 3:40 PM – 4:20 PM (40m)
 * - Period 9: 4:20 PM – 5:00 PM (40m) - PE Preferred
 */
export const DEFAULT_SCHEDULE_CONFIG = {
  academicYear: '2024-2025',
  schoolStartTime: '10:00 AM',
  schoolEndTime: '5:00 PM',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  periods: [
    { periodNumber: 1, label: 'Period 1', startTime: '10:00 AM', endTime: '10:40 AM', duration: 40, isBreak: false },
    { periodNumber: 2, label: 'Period 2', startTime: '10:40 AM', endTime: '11:20 AM', duration: 40, isBreak: false },
    { periodNumber: null, label: '🍵 Morning Short Recess', startTime: '11:20 AM', endTime: '11:35 AM', duration: 15, isBreak: true },
    { periodNumber: 3, label: 'Period 3', startTime: '11:35 AM', endTime: '12:15 PM', duration: 40, isBreak: false },
    { periodNumber: 4, label: 'Period 4', startTime: '12:15 PM', endTime: '12:55 PM', duration: 40, isBreak: false },
    { periodNumber: null, label: '🍱 Lunch Recess', startTime: '12:55 PM', endTime: '1:30 PM', duration: 35, isBreak: true },
    { periodNumber: 5, label: 'Period 5', startTime: '1:30 PM', endTime: '2:10 PM', duration: 40, isBreak: false },
    { periodNumber: 6, label: 'Period 6', startTime: '2:10 PM', endTime: '2:50 PM', duration: 40, isBreak: false },
    { periodNumber: 7, label: 'Period 7', startTime: '2:50 PM', endTime: '3:30 PM', duration: 40, isBreak: false },
    { periodNumber: null, label: '🍵 Afternoon Short Recess', startTime: '3:30 PM', endTime: '3:40 PM', duration: 10, isBreak: true },
    { periodNumber: 8, label: 'Period 8', startTime: '3:40 PM', endTime: '4:20 PM', duration: 40, isBreak: false },
    { periodNumber: 9, label: 'Period 9 (PE Preferred)', startTime: '4:20 PM', endTime: '5:00 PM', duration: 40, isBreak: false },
  ],
  classes: [
    { class: '5', section: 'A', room: 'Room 101' },
    { class: '6', section: 'A', room: 'Room 102' },
    { class: '7', section: 'A', room: 'Room 103' },
    { class: '8', section: 'A', room: 'Room 104' },
    { class: '9', section: 'A', room: 'Room 201' },
    { class: '10', section: 'A', room: 'Room 202' },
  ],
  classTeachers: {
    '5_A': { teacherId: 'ST-007', teacherName: 'Mrs. Vandana Sharma' },
    '6_A': { teacherId: 'ST-006', teacherName: 'Mr. Prakash Kulkarni' },
    '7_A': { teacherId: 'ST-005', teacherName: 'Mr. Deepak Patil' },
    '8_A': { teacherId: 'ST-004', teacherName: 'Mrs. Lata Mehta' },
    '9_A': { teacherId: 'ST-002', teacherName: 'Mrs. Sunita Deshpande' },
    '10_A': { teacherId: 'ST-001', teacherName: 'Mr. Ramesh Gupta' },
  },
  // Teacher-to-subject default eligibility
  subjectTeachers: {
    'Marathi':            { teacherId: 'ST-006', teacherName: 'Mr. Prakash Kulkarni' },
    'English':            { teacherId: 'ST-004', teacherName: 'Mrs. Lata Mehta' },
    'Hindi':              { teacherId: 'ST-007', teacherName: 'Mrs. Vandana Sharma' },
    'Mathematics':        { teacherId: 'ST-001', teacherName: 'Mr. Ramesh Gupta' },     // Classes 5 to 8
    'Algebra':            { teacherId: 'ST-009', teacherName: 'Mr. Nitin Kamble' },      // Classes 9 to 10
    'Geometry':           { teacherId: 'ST-010', teacherName: 'Mrs. Pooja Salunkhe' },   // Classes 9 to 10
    'History':            { teacherId: 'ST-005', teacherName: 'Mr. Deepak Patil' },
    'Geography':          { teacherId: 'ST-008', teacherName: 'Mr. Santosh Chavan' },
    'Science':            { teacherId: 'ST-002', teacherName: 'Mrs. Sunita Deshpande' },
    'Physical Education': { teacherId: 'ST-011', teacherName: 'Mr. Vikram Shinde' },
    'Self-Study':         { teacherId: '',       teacherName: 'Class Mentor / Self-Study' },
    'Library':            { teacherId: 'ST-003', teacherName: 'Mr. Sachin Patil' }
  },
  // Weekly periods required per subject (54 total periods per week: 6 days * 9 periods)
  subjectFrequencies: {
    junior: { // Classes 5-8
      'Marathi': 6,
      'English': 6,
      'Hindi': 6,
      'Mathematics': 6,
      'Science': 6,
      'History': 6,
      'Geography': 6,
      'Physical Education': 3,
      'Self-Study': 9
    },
    senior: { // Classes 9-10
      'Marathi': 6,
      'English': 6,
      'Hindi': 6,
      'Algebra': 6,
      'Geometry': 6,
      'Science': 6,
      'History': 6,
      'Geography': 6,
      'Physical Education': 3,
      'Self-Study': 3
    }
  }
};

/**
 * Validate Timetable for Conflicts across the entire school:
 * 1. Teacher conflicts (same teacher scheduled in 2 classes at same time)
 * 2. Class conflicts (same class has 2 periods at same time)
 * 3. Recess conflicts (teaching period assigned inside recess time)
 * 4. Room conflicts (same room double-booked)
 * 5. Physical education capacity constraints
 */
export function validateTimetableConflicts(timetable, config = DEFAULT_SCHEDULE_CONFIG) {
  const conflicts = [];
  const warnings = [];
  const days = config.workingDays;
  const teachingPeriods = config.periods.filter(p => !p.isBreak);
  const recessPeriods = config.periods.filter(p => p.isBreak);

  // 1. Recess violation check
  recessPeriods.forEach(rec => {
    const recStart = timeToMinutes(rec.startTime);
    const recEnd = timeToMinutes(rec.endTime);

    Object.entries(timetable).forEach(([classKey, schedule]) => {
      days.forEach(day => {
        const slots = schedule[day] || [];
        slots.forEach(slot => {
          if (!slot || !slot.subject || slot.isBreak) return;
          const sStart = timeToMinutes(slot.startTime);
          const sEnd = timeToMinutes(slot.endTime);
          if (intervalsOverlap(sStart, sEnd, recStart, recEnd)) {
            conflicts.push({
              type: 'RECESS_CONFLICT',
              severity: 'error',
              message: `Class ${classKey.replace('_', '-')} has "${slot.subject}" overlapping ${rec.label} (${rec.startTime}–${rec.endTime}) on ${day}`,
              day,
              classKey,
              period: slot.periodNumber,
              time: `${slot.startTime}–${slot.endTime}`
            });
          }
        });
      });
    });
  });

  // 2. Global Teacher, Class & Room Clashes
  days.forEach(day => {
    // Collect all active teaching slots for this day across all classes
    const activeSlots = [];
    Object.entries(timetable).forEach(([classKey, schedule]) => {
      const slots = schedule[day] || [];
      slots.forEach(slot => {
        if (!slot || !slot.subject || slot.isBreak || slot.subject === '—') return;
        activeSlots.push({
          ...slot,
          classKey,
          startMins: timeToMinutes(slot.startTime),
          endMins: timeToMinutes(slot.endTime)
        });
      });
    });

    // Pairwise overlap check
    for (let i = 0; i < activeSlots.length; i++) {
      for (let j = i + 1; j < activeSlots.length; j++) {
        const s1 = activeSlots[i];
        const s2 = activeSlots[j];

        if (intervalsOverlap(s1.startMins, s1.endMins, s2.startMins, s2.endMins)) {
          // Teacher Conflict
          if (s1.teacherId && s2.teacherId && s1.teacherId === s2.teacherId) {
            conflicts.push({
              type: 'TEACHER_CONFLICT',
              severity: 'error',
              message: `Teacher ${s1.teacherName || s1.teacherId} is double-booked on ${day} during ${s1.startTime}–${s1.endTime} in both Class ${s1.classKey.replace('_', '-')} and Class ${s2.classKey.replace('_', '-')}`,
              day,
              period: s1.periodNumber,
              teacherId: s1.teacherId,
              teacherName: s1.teacherName,
              classes: [s1.classKey, s2.classKey],
              time: `${s1.startTime}–${s1.endTime}`
            });
          }

          // Same Class Conflict
          if (s1.classKey === s2.classKey) {
            conflicts.push({
              type: 'CLASS_CONFLICT',
              severity: 'error',
              message: `Class ${s1.classKey.replace('_', '-')} has two overlapping subjects ("${s1.subject}" & "${s2.subject}") on ${day} at ${s1.startTime}–${s1.endTime}`,
              day,
              period: s1.periodNumber,
              classKey: s1.classKey,
              subjects: [s1.subject, s2.subject]
            });
          }

          // Room Conflict (if room specified and differs from own standard room)
          if (s1.room && s2.room && s1.room === s2.room && s1.classKey !== s2.classKey && !s1.room.includes('Ground') && !s1.room.includes('Playground')) {
            conflicts.push({
              type: 'ROOM_CONFLICT',
              severity: 'error',
              message: `Room ${s1.room} is double-booked by Class ${s1.classKey.replace('_', '-')} and Class ${s2.classKey.replace('_', '-')} on ${day} at ${s1.startTime}–${s1.endTime}`,
              day,
              room: s1.room,
              classes: [s1.classKey, s2.classKey]
            });
          }
        }
      }
    }
  });

  // 3. Physical Education Period 9 Preference & Capacity Check
  days.forEach(day => {
    let peCountInPeriod9 = 0;
    const peClassesPeriod9 = [];
    Object.entries(timetable).forEach(([classKey, schedule]) => {
      const p9 = (schedule[day] || []).find(s => s.periodNumber === 9);
      if (p9 && p9.subject === 'Physical Education') {
        peCountInPeriod9++;
        peClassesPeriod9.push(classKey);
      }
    });

    if (peCountInPeriod9 > 1) {
      warnings.push({
        type: 'PE_CAPACITY_WARNING',
        severity: 'warning',
        message: `Multiple classes (${peClassesPeriod9.map(c => c.replace('_', '-')).join(', ')}) have Physical Education in Period 9 on ${day}. Ensure sufficient PE coaches are available.`,
        day,
        period: 9,
        classes: peClassesPeriod9
      });
    }
  });

  return {
    valid: conflicts.length === 0,
    conflictCount: conflicts.length,
    warningCount: warnings.length,
    conflicts,
    warnings
  };
}

/**
 * Generate Conflict-Free Timetable for All Classes simultaneously using Constraint Satisfaction
 */
export function generateFullSchoolTimetable(config = DEFAULT_SCHEDULE_CONFIG, staffList = []) {
  const days = config.workingDays; // 6 days: Mon-Sat
  const teachingPeriods = config.periods.filter(p => !p.isBreak); // 9 periods per day
  const classes = config.classes; // 5A, 6A, 7A, 8A, 9A, 10A

  // Resolve teacher for a subject and class
  function getTeacherFor(subject, classNum) {
    if (subject === 'Mathematics') {
      const t = config.subjectTeachers['Mathematics'];
      return { teacherId: t?.teacherId || 'ST-001', teacherName: t?.teacherName || 'Mr. Ramesh Gupta' };
    }
    if (subject === 'Algebra') {
      const t = config.subjectTeachers['Algebra'];
      return { teacherId: t?.teacherId || 'ST-009', teacherName: t?.teacherName || 'Mr. Nitin Kamble' };
    }
    if (subject === 'Geometry') {
      const t = config.subjectTeachers['Geometry'];
      return { teacherId: t?.teacherId || 'ST-010', teacherName: t?.teacherName || 'Mrs. Pooja Salunkhe' };
    }
    const def = config.subjectTeachers[subject];
    if (def) return { teacherId: def.teacherId, teacherName: def.teacherName };
    return { teacherId: '', teacherName: 'Staff' };
  }

  const timetable = {};
  classes.forEach(c => {
    const key = `${c.class}_${c.section}`;
    timetable[key] = {};
    days.forEach(day => {
      timetable[key][day] = [];
    });
  });

  // Track teacher bookings: teacherBookings[day][periodNumber] = Map(teacherId -> classKey)
  const teacherBookings = {};
  days.forEach(day => {
    teacherBookings[day] = {};
    teachingPeriods.forEach(p => {
      teacherBookings[day][p.periodNumber] = new Map();
    });
  });

  // Track class bookings: classBookings[classKey][day][periodNumber] = slot
  const classBookings = {};
  classes.forEach(c => {
    const key = `${c.class}_${c.section}`;
    classBookings[key] = {};
    days.forEach(day => {
      classBookings[key][day] = {};
    });
  });

  // STEP 1: Schedule Physical Education in Period 9 (4:20 PM – 5:00 PM)
  // Mr. Vikram Shinde is ST-011. Exactly ONE class in Period 9 each day so he never clashes:
  const p9ClassOrder = [
    { classKey: '5_A', day: 'Monday' },
    { classKey: '6_A', day: 'Tuesday' },
    { classKey: '7_A', day: 'Wednesday' },
    { classKey: '8_A', day: 'Thursday' },
    { classKey: '9_A', day: 'Friday' },
    { classKey: '10_A', day: 'Saturday' },
  ];

  const peTeacher = getTeacherFor('Physical Education', '5');
  const p9Info = teachingPeriods.find(p => p.periodNumber === 9);

  p9ClassOrder.forEach(item => {
    const slot = {
      periodNumber: 9,
      startTime: p9Info.startTime,
      endTime: p9Info.endTime,
      duration: p9Info.duration,
      subject: 'Physical Education',
      teacherId: peTeacher.teacherId,
      teacherName: peTeacher.teacherName,
      room: 'School Ground',
      isBreak: false
    };
    classBookings[item.classKey][item.day][9] = slot;
    teacherBookings[item.day][9].set(peTeacher.teacherId, item.classKey);
  });

  // Schedule remaining PE periods (2 per class) in non-conflicting periods
  const additionalPeSlots = [
    { classKey: '5_A', day: 'Wednesday', period: 8 },
    { classKey: '5_A', day: 'Friday',    period: 8 },
    { classKey: '6_A', day: 'Thursday',  period: 8 },
    { classKey: '6_A', day: 'Saturday',  period: 8 },
    { classKey: '7_A', day: 'Monday',    period: 8 },
    { classKey: '7_A', day: 'Friday',    period: 7 },
    { classKey: '8_A', day: 'Tuesday',   period: 8 },
    { classKey: '8_A', day: 'Friday',    period: 6 },
    { classKey: '9_A', day: 'Monday',    period: 7 },
    { classKey: '9_A', day: 'Wednesday', period: 7 },
    { classKey: '10_A', day: 'Tuesday',  period: 7 },
    { classKey: '10_A', day: 'Thursday', period: 7 },
  ];

  additionalPeSlots.forEach(item => {
    const pInfo = teachingPeriods.find(p => p.periodNumber === item.period);
    const slot = {
      periodNumber: item.period,
      startTime: pInfo.startTime,
      endTime: pInfo.endTime,
      duration: pInfo.duration,
      subject: 'Physical Education',
      teacherId: peTeacher.teacherId,
      teacherName: peTeacher.teacherName,
      room: 'School Ground',
      isBreak: false
    };
    classBookings[item.classKey][item.day][item.period] = slot;
    teacherBookings[item.day][item.period].set(peTeacher.teacherId, item.classKey);
  });

  // STEP 2: Main Academic Subjects Allocation with Constraint Solver
  const classSubjectQuota = {};
  classes.forEach(c => {
    const key = `${c.class}_${c.section}`;
    const isSenior = parseInt(c.class) >= 9;
    const freqSource = isSenior ? config.subjectFrequencies.senior : config.subjectFrequencies.junior;
    classSubjectQuota[key] = { ...freqSource };
    classSubjectQuota[key]['Physical Education'] = 0; // already allocated
  });

  const coreSubjectsJunior = ['Marathi', 'English', 'Hindi', 'Mathematics', 'Science', 'History', 'Geography'];
  const coreSubjectsSenior = ['Marathi', 'English', 'Hindi', 'Algebra', 'Geometry', 'Science', 'History', 'Geography'];

  days.forEach((day) => {
    teachingPeriods.forEach(p => {
      const periodNum = p.periodNumber;

      classes.forEach((c) => {
        const classKey = `${c.class}_${c.section}`;
        const isSenior = parseInt(c.class) >= 9;
        const quota = classSubjectQuota[classKey];

        if (classBookings[classKey][day][periodNum]) return;

        const subjects = isSenior ? coreSubjectsSenior : coreSubjectsJunior;
        let placed = false;
        const candidates = [...subjects, 'Self-Study'];

        candidates.sort((a, b) => (quota[b] || 0) - (quota[a] || 0));

        for (const subj of candidates) {
          if (!quota[subj] || quota[subj] <= 0) continue;

          // Avoid repeating the same subject twice on the same day if possible
          const alreadyHadToday = Object.values(classBookings[classKey][day]).some(s => s.subject === subj);
          if (alreadyHadToday && candidates.some(other => (quota[other] || 0) > 0 && !Object.values(classBookings[classKey][day]).some(s => s.subject === other))) {
            continue;
          }

          const teacherInfo = getTeacherFor(subj, c.class);

          if (teacherInfo.teacherId) {
            const bookedClass = teacherBookings[day][periodNum].get(teacherInfo.teacherId);
            if (bookedClass) continue; // Teacher clash
          }

          const slot = {
            periodNumber: periodNum,
            startTime: p.startTime,
            endTime: p.endTime,
            duration: p.duration,
            subject: subj,
            teacherId: teacherInfo.teacherId,
            teacherName: teacherInfo.teacherName,
            room: c.room,
            isBreak: false
          };

          classBookings[classKey][day][periodNum] = slot;
          if (teacherInfo.teacherId) {
            teacherBookings[day][periodNum].set(teacherInfo.teacherId, classKey);
          }
          quota[subj]--;
          placed = true;
          break;
        }

        if (!placed) {
          const slot = {
            periodNumber: periodNum,
            startTime: p.startTime,
            endTime: p.endTime,
            duration: p.duration,
            subject: 'Self-Study',
            teacherId: '',
            teacherName: 'Class Mentor / Self-Study',
            room: c.room,
            isBreak: false
          };
          classBookings[classKey][day][periodNum] = slot;
          if (quota['Self-Study'] > 0) quota['Self-Study']--;
        }
      });
    });
  });

  // Assemble full timetable object with complete day arrays sorted by period & recesses
  classes.forEach(c => {
    const key = `${c.class}_${c.section}`;
    days.forEach(day => {
      const list = [];
      config.periods.forEach(p => {
        if (p.isBreak) {
          list.push({
            periodNumber: null,
            label: p.label,
            startTime: p.startTime,
            endTime: p.endTime,
            duration: p.duration,
            subject: p.label,
            teacherId: '',
            teacherName: '',
            room: '—',
            isBreak: true
          });
        } else {
          const booked = classBookings[key][day][p.periodNumber];
          if (booked) {
            list.push(booked);
          } else {
            list.push({
              periodNumber: p.periodNumber,
              label: p.label,
              startTime: p.startTime,
              endTime: p.endTime,
              duration: p.duration,
              subject: 'Self-Study',
              teacherId: '',
              teacherName: 'Class Mentor / Self-Study',
              room: c.room,
              isBreak: false
            });
          }
        }
      });
      timetable[key][day] = list;
    });
  });

  const validation = validateTimetableConflicts(timetable, config);

  return {
    academicYear: config.academicYear,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    validation,
    classes: timetable
  };
}
