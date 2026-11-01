/* ============================================================
   Test All API Endpoints — Shanti Gurukul API
   ============================================================ */
const BASE_URL = 'http://localhost:5000/api';

async function testEndpoints() {
  console.log('🧪 Starting End-to-End API Health & Endpoint Verification...\n');

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      const res = await fn();
      if (res.ok) {
        console.log(`  ✅ [${res.status}] ${name}`);
        passed++;
      } else {
        console.error(`  ❌ [${res.status}] ${name} — ${res.statusText}`);
        failed++;
      }
    } catch (err) {
      console.error(`  ❌ [ERROR] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check (public)
  await check('GET /health', () => fetch(`${BASE_URL}/health`));

  // 2. Auth login
  let token = '';
  await check('POST /auth/login (admin)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'gurukul@2024' })
    });
    if (res.ok) {
      const data = await res.json();
      token = data.token;
      return { ok: true, status: res.status };
    }
    return { ok: false, status: res.status, statusText: 'Login failed' };
  });

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 3. Auth Me
  await check('GET /auth/me', () => fetch(`${BASE_URL}/auth/me`, { headers: authHeaders }));

  // 4. Dashboard Stats
  await check('GET /dashboard/stats', () => fetch(`${BASE_URL}/dashboard/stats`, { headers: authHeaders }));

  // 5. Students
  await check('GET /students', () => fetch(`${BASE_URL}/students`, { headers: authHeaders }));
  await check('GET /students/stats', () => fetch(`${BASE_URL}/students/stats`, { headers: authHeaders }));

  // 6. Staff
  await check('GET /staff', () => fetch(`${BASE_URL}/staff`, { headers: authHeaders }));

  // 7. Attendance
  await check('GET /attendance', () => fetch(`${BASE_URL}/attendance`, { headers: authHeaders }));

  // 8. Fees
  await check('GET /fees', () => fetch(`${BASE_URL}/fees`, { headers: authHeaders }));
  await check('GET /fees/structure', () => fetch(`${BASE_URL}/fees/structure`, { headers: authHeaders }));

  // 9. Results
  await check('GET /results', () => fetch(`${BASE_URL}/results`, { headers: authHeaders }));

  // 10. Hostel
  await check('GET /hostel/rooms', () => fetch(`${BASE_URL}/hostel/rooms`, { headers: authHeaders }));
  await check('GET /hostel/leaves', () => fetch(`${BASE_URL}/hostel/leaves`, { headers: authHeaders }));

  // 11. Medical
  await check('GET /medical', () => fetch(`${BASE_URL}/medical`, { headers: authHeaders }));

  // 12. Expenses
  await check('GET /expenses', () => fetch(`${BASE_URL}/expenses`, { headers: authHeaders }));

  // 13. Teacher Leave
  await check('GET /teacher-leave', () => fetch(`${BASE_URL}/teacher-leave`, { headers: authHeaders }));

  // 14. Timetable
  await check('GET /timetable/10_A', () => fetch(`${BASE_URL}/timetable/10_A`, { headers: authHeaders }));

  // 15. Achievements
  await check('GET /achievements', () => fetch(`${BASE_URL}/achievements`, { headers: authHeaders }));

  // 16. Sports
  await check('GET /sports', () => fetch(`${BASE_URL}/sports`, { headers: authHeaders }));

  // 17. Mess
  await check('GET /mess', () => fetch(`${BASE_URL}/mess`, { headers: authHeaders }));

  // 18. Notices
  await check('GET /notices', () => fetch(`${BASE_URL}/notices`, { headers: authHeaders }));

  // 19. Mentor
  await check('GET /mentor', () => fetch(`${BASE_URL}/mentor`, { headers: authHeaders }));

  // 20. Parent
  await check('GET /parent/student/STU-2024-001', () => fetch(`${BASE_URL}/parent/student/STU-2024-001`, { headers: authHeaders }));

  console.log(`\n========================================`);
  console.log(`Total Endpoints Tested: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testEndpoints();
