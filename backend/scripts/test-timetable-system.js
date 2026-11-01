/* ============================================================
   Automated Verification Suite — Shanti Gurukul Timetable System
   Validates Updated Timings, Afternoon Recess, and Zero Moral Science
   ============================================================ */

import http from 'http';

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST', headers }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function put(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'PUT', headers }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, method: 'GET', headers }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject); req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING SHANTI GURUKUL FINAL TIMETABLE SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(testNum, desc, condition, detail = '') {
    if (condition) {
      console.log(`✅ [TEST ${String(testNum).padStart(2, '0')}] PASS: ${desc}`);
      passedCount++;
    } else {
      console.error(`❌ [TEST ${String(testNum).padStart(2, '0')}] FAIL: ${desc} ${detail ? '(' + detail + ')' : ''}`);
      failedCount++;
    }
  }

  // Auth tokens
  const adminRes = await post('http://localhost:5001/api/auth/login', { username: 'admin', password: 'admin123' });
  const adminToken = adminRes.data.token;

  const teacherVikram = await post('http://localhost:5001/api/auth/login', { username: 'vikram', password: 'teacher123' });
  const vikramToken = teacherVikram.data.token;

  // 1 & 2. School timings
  const cfgRes = await get('http://localhost:5001/api/timetable/config', adminToken);
  const cfg = cfgRes.data;

  assert(1, 'School timing starts at 10:00 AM', cfg.schoolStartTime === '10:00 AM');
  assert(2, 'School timing ends at 5:00 PM', cfg.schoolEndTime === '5:00 PM');

  // 3. Morning short recess is 11:20–11:35 AM
  const morningRecess = cfg.periods.find(p => p.isBreak && p.startTime === '11:20 AM' && p.endTime === '11:35 AM');
  assert(3, 'Morning Short Recess is 11:20–11:35 AM', Boolean(morningRecess));

  // 4. Lunch recess is 12:55–1:30 PM
  const lunchRecess = cfg.periods.find(p => p.isBreak && p.startTime === '12:55 PM' && p.endTime === '1:30 PM');
  assert(4, 'Lunch Recess is 12:55–1:30 PM', Boolean(lunchRecess));

  // 5. Afternoon short recess is 3:30–3:40 PM
  const afternoonRecess = cfg.periods.find(p => p.isBreak && p.startTime === '3:30 PM' && p.endTime === '3:40 PM');
  assert(5, 'Afternoon Short Recess is 3:30–3:40 PM', Boolean(afternoonRecess));

  // 6. Period 8 is 3:40–4:20 PM
  const period8 = cfg.periods.find(p => p.periodNumber === 8 && p.startTime === '3:40 PM' && p.endTime === '4:20 PM');
  assert(6, 'Period 8 is 3:40–4:20 PM', Boolean(period8));

  // 7. Period 9 is 4:20–5:00 PM
  const period9 = cfg.periods.find(p => p.periodNumber === 9 && p.startTime === '4:20 PM' && p.endTime === '5:00 PM');
  assert(7, 'Period 9 is 4:20–5:00 PM', Boolean(period9));

  // 8. Total 9 teaching periods + 3 recesses (12 slots)
  assert(8, 'Total schedule has 9 teaching periods + 3 recesses (12 slots)', cfg.periods.length === 12);

  // 9. Moral Science is COMPLETELY REMOVED from subject config & frequencies
  const hasMoralScienceConfig = Object.keys(cfg.subjectTeachers || {}).includes('Moral Science') ||
    Object.keys(cfg.subjectFrequencies?.junior || {}).includes('Moral Science') ||
    Object.keys(cfg.subjectFrequencies?.senior || {}).includes('Moral Science');
  assert(9, 'Moral Science is completely removed from subject configuration', !hasMoralScienceConfig);

  // 10. Check published timetable for zero Moral Science
  const pubRes = await get('http://localhost:5001/api/timetable/published', adminToken);
  const pub = pubRes.data;

  let anyMoralScienceInSchedule = false;
  Object.values(pub.classes).forEach(days => {
    Object.values(days).forEach(slots => {
      slots.forEach(s => {
        if (s.subject === 'Moral Science') anyMoralScienceInSchedule = true;
      });
    });
  });
  assert(10, 'Published timetable contains ZERO Moral Science entries', !anyMoralScienceInSchedule);

  // 11. No teaching overlaps with any of the 3 recesses
  let anyRecessOverlap = false;
  const breakTimes = ['11:20 AM', '12:55 PM', '3:30 PM'];
  Object.values(pub.classes).forEach(days => {
    Object.values(days).forEach(slots => {
      slots.forEach(s => {
        if (!s.isBreak && breakTimes.includes(s.startTime)) anyRecessOverlap = true;
      });
    });
  });
  assert(11, 'Zero classes overlap with Morning, Lunch, or Afternoon recesses', !anyRecessOverlap);

  // 12. Period 9 Physical Education distribution (4:20 PM - 5:00 PM)
  let p9PeDays = 0;
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(day => {
    let dayHasPEInP9 = false;
    Object.values(pub.classes).forEach(days => {
      const p9 = days[day]?.find(s => s.periodNumber === 9);
      if (p9 && p9.subject === 'Physical Education' && p9.startTime === '4:20 PM' && p9.endTime === '5:00 PM') {
        dayHasPEInP9 = true;
      }
    });
    if (dayHasPEInP9) p9PeDays++;
  });
  assert(12, 'Physical Education is placed in Period 9 (4:20–5:00 PM) for each class across days', p9PeDays === 6);

  // 13. Total school-wide clashes is 0
  assert(13, 'Total scheduling conflicts across all classes & teachers is ZERO', pub.validation.valid && pub.validation.conflictCount === 0);

  // 14. Classes 5-8 use Mathematics; Classes 9-10 use Algebra & Geometry
  const c5Subjects = new Set();
  Object.values(pub.classes['5_A']).forEach(slots => slots.forEach(s => !s.isBreak && c5Subjects.add(s.subject)));
  const c10Subjects = new Set();
  Object.values(pub.classes['10_A']).forEach(slots => slots.forEach(s => !s.isBreak && c10Subjects.add(s.subject)));

  assert(14, 'Junior wing has Mathematics; Senior wing has Algebra & Geometry (no Moral Science)',
    c5Subjects.has('Mathematics') && !c5Subjects.has('Algebra') &&
    c10Subjects.has('Algebra') && c10Subjects.has('Geometry') && !c10Subjects.has('Mathematics') &&
    !c5Subjects.has('Moral Science') && !c10Subjects.has('Moral Science')
  );

  // 15. Vikram Shinde schedule has 3 recesses and new timings
  const vikramSched = await get('http://localhost:5001/api/timetable/my-schedule', vikramToken);
  const monSlots = vikramSched.data.weeklySchedule.Monday;
  const monAfternoonRecess = monSlots.find(s => s.isBreak && s.startTime === '3:30 PM');
  const monP8 = monSlots.find(s => s.periodNumber === 8 && s.startTime === '3:40 PM');
  const monP9 = monSlots.find(s => s.periodNumber === 9 && s.startTime === '4:20 PM');

  assert(15, 'Teacher personal schedule displays Afternoon Recess (3:30–3:40), P8 (3:40–4:20), and P9 (4:20–5:00)',
    Boolean(monAfternoonRecess) && Boolean(monP8) && Boolean(monP9)
  );

  console.log('\n====================================================');
  console.log(`🏁 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of 15`);
  console.log('====================================================\n');
}

runTestSuite().catch(console.error);
