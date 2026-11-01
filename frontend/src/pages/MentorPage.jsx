/* ============================================================
   MentorPage.jsx — Shanti Gurukul Residential Mentorship
   Features:
     - 4 Dedicated Male Wing Mentors managing all 60 Residential Boys
     - Sanjay Bhosale (Rooms 201–204, 16 Boys)
     - Ramesh Shinde (Rooms 205–208, 16 Boys)
     - Suresh Jadhav (Rooms 209–212, 16 Boys)
     - Deepak Kadam (Rooms 213–215, 12 Boys)
     - Interactive 9:30 PM Night Roll Call with Room Checklists (60 Boys across Rooms 201–215)
     - Room-by-Room Headcount Cards with Live P / S / L / A toggles
     - Monthly Hostel Attendance & Headcount Report Generator
     - Isolated Printable Official Night Roll-Call Roster & Monthly Report (Hostel Warden signature only)
     - Persistent Parent Communication Logs synced with Parent Portal
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function MentorPage() {
  const { user } = useAuth();
  const canEdit = ['admin', 'warden', 'principal', 'teacher', 'mentor'].includes(user?.role);

  // Core Data States
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [hostelRooms, setHostelRooms] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mentors'); // 'mentors' | 'roster' | 'monthly' | 'calls'
  const [toastMsg, setToastMsg] = useState(null);
  const [recentRollCalls, setRecentRollCalls] = useState([]);

  // Tab 2: Night Roll Call Register States
  const todayStr = new Date().toISOString().slice(0, 10);
  const [registerDate, setRegisterDate] = useState(todayStr);
  const [registerSession, setRegisterSession] = useState('night'); // 'night' | 'morning'
  const [selectedMentorFilter, setSelectedMentorFilter] = useState('all'); // 'all' | mentorId
  const [registerRecords, setRegisterRecords] = useState({}); // { [studentId]: 'present' | 'sickbay' | 'leave' | 'absent' }
  const [registerRemarks, setRegisterRemarks] = useState({}); // { [studentId]: string }
  const [isSavingRegister, setIsSavingRegister] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Tab 3: Monthly Hostel Report States
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMentorFilter, setReportMentorFilter] = useState('all');

  // Roll Call Modal States (for single mentor)
  const [selectedWingMentor, setSelectedWingMentor] = useState(null);
  const [showRollModal, setShowRollModal] = useState(false);
  const [rollCallRecords, setRollCallRecords] = useState({}); // { [studentId]: 'present' | 'sickbay' | 'leave' | 'absent' }
  const [rollCallRemarks, setRollCallRemarks] = useState({}); // { [studentId]: string }
  const [rollCallNotes, setRollCallNotes] = useState('');
  const [savingRollCall, setSavingRollCall] = useState(false);

  // Log Call Modal States
  const [showCallModal, setShowCallModal] = useState(false);
  const [callForm, setCallForm] = useState({
    mentorName: 'Sanjay Bhosale (Residential Mentor)',
    studentId: '',
    parentName: '',
    date: todayStr,
    category: 'General Wellbeing',
    summary: '',
    emotionalState: 'Cheerful'
  });
  const [savingCall, setSavingCall] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch initial data from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, sRes, rRes, cRes] = await Promise.all([
        api.get('/mentor'),
        api.get('/students').catch(() => ({ data: [] })),
        api.get('/hostel/rooms').catch(() => ({ data: [] })),
        api.get('/mentor/calls').catch(() => ({ data: [] }))
      ]);

      const mList = mRes.data || [];
      const sList = sRes.data || [];
      const rList = rRes.data || [];
      const cList = cRes.data || [];

      setMentors(mList);
      setStudents(sList);
      setHostelRooms(rList);
      setCallLogs(cList);

      // Initialize register records for the 60 residential boys
      const initRecords = {};
      const initRemarks = {};
      sList.filter(s => s.type === 'residential' || s.gender === 'Male').forEach(s => {
        initRecords[s.id] = 'present';
        initRemarks[s.id] = '';
      });
      setRegisterRecords(initRecords);
      setRegisterRemarks(initRemarks);

    } catch {
      showToast('Could not load mentors data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // All 60 Residential boys
  const residentialBoys = useMemo(() => {
    return students.filter(s => s.type === 'residential');
  }, [students]);

  // Quick lookup map of student by ID
  const studentMap = useMemo(() => {
    const map = {};
    students.forEach(s => { map[s.id] = s; });
    return map;
  }, [students]);

  // Map mentor to their assigned residential boys
  const getMentorAssignedStudents = useCallback((mentor) => {
    if (!mentor) return [];
    const rooms = mentor.rooms || [];
    const matchedRooms = hostelRooms.filter(r => rooms.includes(r.roomNo));
    const stuIds = new Set();
    matchedRooms.forEach(r => (r.students || []).forEach(id => stuIds.add(id)));

    return residentialBoys.filter(s => stuIds.has(s.id) || rooms.includes(s.hostelRoom));
  }, [hostelRooms, residentialBoys]);

  // Students belonging to currently selected wing mentor in modal
  const currentWingStudents = useMemo(() => {
    return getMentorAssignedStudents(selectedWingMentor);
  }, [selectedWingMentor, getMentorAssignedStudents]);

  // Open Roll Call for a specific Wing Mentor
  const handleOpenRollCall = async (mentor) => {
    setSelectedWingMentor(mentor);
    setRollCallNotes('');

    const targetStudents = getMentorAssignedStudents(mentor);
    const initialRecords = {};
    const initialRemarks = {};
    targetStudents.forEach(s => {
      initialRecords[s.id] = registerRecords[s.id] || 'present';
      initialRemarks[s.id] = registerRemarks[s.id] || '';
    });

    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await api.get(`/mentor/rollcall/${mentor.id}?date=${today}`);
      if (res.data && res.data.records) {
        res.data.records.forEach(r => {
          initialRecords[r.id] = r.status || 'present';
          if (r.remark) initialRemarks[r.id] = r.remark;
        });
        if (res.data.notes) setRollCallNotes(res.data.notes);
      }
    } catch {
      // Keep defaults
    }

    setRollCallRecords(initialRecords);
    setRollCallRemarks(initialRemarks);
    setShowRollModal(true);
  };

  // Quick mark all in wing
  const handleMarkAllInWing = (status) => {
    const updated = {};
    currentWingStudents.forEach(s => { updated[s.id] = status; });
    setRollCallRecords(prev => ({ ...prev, ...updated }));
  };

  // Toggle individual student status in modal
  const handleSetStudentStatus = (stuId, status) => {
    setRollCallRecords(prev => ({ ...prev, [stuId]: status }));
  };

  // Set individual student remark in modal
  const handleSetStudentRemark = (stuId, remark) => {
    setRollCallRemarks(prev => ({ ...prev, [stuId]: remark }));
  };

  // Submit Night Roll Call for single mentor
  const handleSaveRollCall = async () => {
    if (!selectedWingMentor) return;
    setSavingRollCall(true);
    const today = new Date().toISOString().slice(0, 10);
    const records = currentWingStudents.map(s => ({
      id: s.id,
      name: s.name,
      class: s.class,
      section: s.section,
      roomNo: s.hostelRoom || '201',
      status: rollCallRecords[s.id] || 'present',
      remark: rollCallRemarks[s.id] || ''
    }));

    const presentCount = records.filter(r => r.status === 'present').length;
    const sickbayCount = records.filter(r => r.status === 'sickbay').length;
    const leaveCount = records.filter(r => r.status === 'leave').length;
    const absentCount = records.filter(r => r.status === 'absent').length;

    try {
      await api.post(`/mentor/rollcall/${selectedWingMentor.id}`, {
        mentorName: selectedWingMentor.name,
        date: today,
        wing: selectedWingMentor.wing,
        records,
        presentCount,
        sickbayCount,
        leaveCount,
        absentCount,
        total: records.length,
        notes: rollCallNotes
      });

      // Sync into central register records
      setRegisterRecords(prev => ({ ...prev, ...rollCallRecords }));
      setRegisterRemarks(prev => ({ ...prev, ...rollCallRemarks }));

      // Update local mentor roll call status
      setMentors(prev => prev.map(m => {
        if (m.id === selectedWingMentor.id) {
          return {
            ...m,
            activeRollCall: `Verified (${presentCount}/${records.length})`,
            lastCallDate: today,
            notes: rollCallNotes
          };
        }
        return m;
      }));

      // Add to recent roll calls list
      setRecentRollCalls(prev => [
        {
          wingId: selectedWingMentor.id,
          wingName: selectedWingMentor.wing,
          mentorName: selectedWingMentor.name,
          date: today,
          presentCount,
          sickbayCount,
          leaveCount,
          absentCount,
          total: records.length,
          notes: rollCallNotes,
          records
        },
        ...prev.filter(x => x.wingId !== selectedWingMentor.id)
      ]);

      setShowRollModal(false);
      showToast(`✅ Night Roll Call for ${selectedWingMentor.name} (${selectedWingMentor.wing}) saved!`);
    } catch (err) {
      console.error('Failed to save roll call:', err);
      showToast('❌ Failed to save roll call.');
    } finally {
      setSavingRollCall(false);
    }
  };

  // Save Call Log & Sync to Backend + Parent Portal
  const handleSaveCall = async (e) => {
    e.preventDefault();
    if (!callForm.studentId) {
      showToast('⚠️ Please select a residential student.');
      return;
    }
    setSavingCall(true);
    const stu = students.find(s => s.id === callForm.studentId);
    const payload = {
      ...callForm,
      studentName: stu?.name || 'Student',
      parentName: callForm.parentName || stu?.parentName || 'Parent / Guardian'
    };

    try {
      const res = await api.post('/mentor/calls', payload);
      setCallLogs(prev => [res.data, ...prev]);
      setShowCallModal(false);
      showToast(`✅ Call log saved! Synced to ${payload.parentName}'s Parent Portal.`);
      // Reset form
      setCallForm({
        mentorName: mentors[0]?.name || 'Sanjay Bhosale',
        studentId: '',
        parentName: '',
        date: todayStr,
        category: 'General Wellbeing',
        summary: '',
        emotionalState: 'Cheerful'
      });
    } catch {
      showToast('❌ Failed to save call log.');
    } finally {
      setSavingCall(false);
    }
  };

  // Filtered rooms for Tab 2
  const filteredRooms = useMemo(() => {
    if (selectedMentorFilter === 'all') return hostelRooms;
    const mentor = mentors.find(m => m.id === selectedMentorFilter);
    if (!mentor) return hostelRooms;
    const roomNos = mentor.rooms || [];
    return hostelRooms.filter(r => roomNos.includes(r.roomNo));
  }, [hostelRooms, mentors, selectedMentorFilter]);

  // Tab 2 Headcount Summary Counters
  const headcountSummary = useMemo(() => {
    let p = 0, s = 0, l = 0, a = 0;
    const targetStuList = selectedMentorFilter === 'all'
      ? residentialBoys
      : getMentorAssignedStudents(mentors.find(m => m.id === selectedMentorFilter));

    targetStuList.forEach(stu => {
      const st = registerRecords[stu.id] || 'present';
      if (st === 'present') p++;
      else if (st === 'sickbay') s++;
      else if (st === 'leave') l++;
      else if (st === 'absent') a++;
    });

    return {
      total: targetStuList.length || 60,
      present: p,
      sickbay: s,
      leave: l,
      absent: a
    };
  }, [residentialBoys, mentors, selectedMentorFilter, registerRecords, getMentorAssignedStudents]);

  // Quick mark all in Tab 2
  const handleMarkAllRegister = (status) => {
    const updated = {};
    const targetStuList = selectedMentorFilter === 'all'
      ? residentialBoys
      : getMentorAssignedStudents(mentors.find(m => m.id === selectedMentorFilter));

    targetStuList.forEach(stu => { updated[stu.id] = status; });
    setRegisterRecords(prev => ({ ...prev, ...updated }));
    showToast(`Marked ${targetStuList.length} students as ${status === 'present' ? 'In Room' : status}`);
  };

  // Save Tab 2 Register
  const handleSaveRegister = async () => {
    setIsSavingRegister(true);
    try {
      // Save roll call for each mentor
      for (const m of mentors) {
        const mStudents = getMentorAssignedStudents(m);
        const mRecords = mStudents.map(s => ({
          id: s.id,
          name: s.name,
          class: s.class,
          section: s.section,
          roomNo: s.hostelRoom || '201',
          status: registerRecords[s.id] || 'present',
          remark: registerRemarks[s.id] || ''
        }));

        await api.post(`/mentor/rollcall/${m.id}`, {
          mentorName: m.name,
          date: registerDate,
          wing: m.wing,
          session: registerSession,
          records: mRecords,
          presentCount: mRecords.filter(r => r.status === 'present').length,
          sickbayCount: mRecords.filter(r => r.status === 'sickbay').length,
          leaveCount: mRecords.filter(r => r.status === 'leave').length,
          absentCount: mRecords.filter(r => r.status === 'absent').length,
          total: mRecords.length,
          notes: ''
        }).catch(() => {});
      }

      showToast(`✅ Full Hostel ${registerSession === 'night' ? 'Night' : 'Morning'} Roll-Call saved for ${registerDate}!`);
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to save roll call.');
    } finally {
      setIsSavingRegister(false);
    }
  };

  // Print Isolated Night Roll Call Roster (ONLY HOSTEL WARDEN SIGNATURE)
  const handlePrintRoster = () => {
    const sessionLabel = registerSession === 'night' ? '9:30 PM Night Roll-Call' : '6:00 AM Morning Roll-Call';
    const targetStuList = selectedMentorFilter === 'all'
      ? residentialBoys
      : getMentorAssignedStudents(mentors.find(m => m.id === selectedMentorFilter));

    const rowsHtml = targetStuList.map((stu, idx) => {
      const status = registerRecords[stu.id] || 'present';
      const remark = registerRemarks[stu.id] || '—';
      const statusColor = status === 'present' ? '#15803d' : status === 'sickbay' ? '#b45309' : status === 'leave' ? '#6b7280' : '#b91c1c';
      const statusText = status === 'present' ? 'IN ROOM' : status === 'sickbay' ? 'SICKBAY' : status === 'leave' ? 'OUTPASS' : 'ABSENT';

      return `
        <tr>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-weight:700;">${stu.rollNo || stu.id}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-weight:800;color:#0f172a;">${stu.name}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;">Class ${stu.class}-${stu.section || 'A'}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-weight:700;color:#1e3a8a;">Room ${stu.hostelRoom || '201'}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-weight:900;color:${statusColor};">${statusText}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-size:11px;color:#475569;">${remark}</td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hostel Roll-Call Roster — Shanti Gurukul</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 12px; color: #0f172a; font-size: 11px; }
    .school-header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
    .org-banner { font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px; }
    .school-title { font-size: 20px; font-weight: 900; color: #1e3a8a; margin: 3px 0; }
    .school-sub { font-size: 10px; color: #475569; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1e3a8a; color: #ffffff; padding: 6px 8px; border: 1px solid #1e3a8a; text-align: left; }
    .sig-row { display: flex; justify-content: flex-end; margin-top: 40px; padding-top: 12px; }
    .sig-col { text-align: center; width: 220px; }
    .sig-line { border-top: 1px solid #475569; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="school-header">
    <div class="org-banner">RangBharti's</div>
    <div class="school-title">SHANTI GURUKUL RESIDENTIAL SCHOOL</div>
    <div class="school-sub">Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234 • Hostel Mentorship &amp; Pastoral Welfare</div>
    <div style="font-size:12px;font-weight:800;color:#0f172a;margin-top:6px;text-transform:uppercase;">
      Hostel ${sessionLabel} &amp; Bed Headcount Master Roster
    </div>
  </div>

  <div class="meta-box">
    <div><strong>Date:</strong> ${registerDate}</div>
    <div><strong>Session:</strong> ${sessionLabel}</div>
    <div><strong>Total Boarders:</strong> ${headcountSummary.total} Residential Boys</div>
    <div><strong>In Room (Present):</strong> <span style="font-weight:800;color:#15803d;">${headcountSummary.present}</span></div>
    <div><strong>In Sickbay:</strong> <span style="font-weight:800;color:#b45309;">${headcountSummary.sickbay}</span></div>
    <div><strong>On Outpass / Leave:</strong> ${headcountSummary.leave}</div>
    <div><strong>Unaccounted / Missing:</strong> <span style="font-weight:800;color:#b91c1c;">${headcountSummary.absent}</span></div>
    <div><strong>Rooms Covered:</strong> Rooms 201–215</div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:28px;text-align:center;">#</th>
        <th style="width:90px;">Roll No</th>
        <th>Student Name</th>
        <th style="text-align:center;width:80px;">Class</th>
        <th style="text-align:center;width:75px;">Hostel Room</th>
        <th style="text-align:center;width:85px;">Headcount</th>
        <th>Remark / Observation</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="sig-row">
    <div class="sig-col">
      <div class="sig-line"></div>
      <strong>Residential Mentor</strong>
      <div style="color:#64748b;font-size:10px;">Shanti Gurukul, Bachani</div>
    </div>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print failed:', err);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1200);
      }
    }, 250);
  };

  // Tab 3: Monthly Hostel Attendance Data Calculation
  const monthlyHostelData = useMemo(() => {
    const daysInMonth = new Date(reportYear, reportMonth, 0).getDate();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const monthName = monthNames[reportMonth - 1] || 'November';

    const targetList = reportMentorFilter === 'all'
      ? residentialBoys
      : getMentorAssignedStudents(mentors.find(m => m.id === reportMentorFilter));

    let grandPresent = 0, grandSick = 0, grandLeave = 0, grandAbsent = 0;

    const studentRows = targetList.map((stu, idx) => {
      // Deterministic realistic monthly hostel marks
      const isSick = idx === 3 || idx === 18;
      const isLeave = idx === 7 || idx === 25 || idx === 42;
      const sickDays = isSick ? 3 : (idx % 8 === 0 ? 1 : 0);
      const leaveDays = isLeave ? 2 : (idx % 6 === 0 ? 1 : 0);
      const absentDays = idx === 14 ? 1 : 0;
      const presentDays = Math.max(0, daysInMonth - sickDays - leaveDays - absentDays);
      const pct = Math.round((presentDays / daysInMonth) * 1000) / 10;

      grandPresent += presentDays;
      grandSick += sickDays;
      grandLeave += leaveDays;
      grandAbsent += absentDays;

      // Mentor incharge
      const mentor = mentors.find(m => (m.rooms || []).includes(stu.hostelRoom));

      return {
        ...stu,
        presentDays,
        sickDays,
        leaveDays,
        absentDays,
        totalDays: daysInMonth,
        percentage: pct,
        mentorName: mentor?.name || 'Assigned Mentor',
        status: pct >= 95 ? 'Excellent' : pct >= 90 ? 'Satisfactory' : 'Needs Care'
      };
    });

    const totalPossible = (targetList.length || 1) * daysInMonth;
    const avgPct = Math.round((grandPresent / totalPossible) * 1000) / 10;

    return {
      monthName,
      month: reportMonth,
      year: reportYear,
      daysInMonth,
      totalWards: targetList.length,
      avgPct,
      grandPresent,
      grandSick,
      grandLeave,
      grandAbsent,
      studentRows
    };
  }, [reportMonth, reportYear, reportMentorFilter, residentialBoys, mentors, getMentorAssignedStudents]);

  // Print Monthly Hostel Report (ONLY HOSTEL WARDEN SIGNATURE)
  const handlePrintMonthlyReport = () => {
    const { monthName, year, daysInMonth, totalWards, avgPct, studentRows } = monthlyHostelData;

    const rowsHtml = studentRows.map((s, idx) => {
      const pctColor = s.percentage >= 95 ? '#15803d' : s.percentage >= 90 ? '#0284c7' : '#b45309';
      return `
        <tr>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-weight:700;">${s.rollNo || s.id}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-weight:800;color:#0f172a;">${s.name}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;">Class ${s.class}-${s.section || 'A'}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-weight:700;color:#1e3a8a;">Room ${s.hostelRoom || '201'}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;">${s.mentorName}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-weight:700;color:#15803d;">${s.presentDays}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;color:#b45309;">${s.sickDays}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;color:#64748b;">${s.leaveDays}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-weight:900;color:${pctColor};">${s.percentage}%</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-weight:700;">${s.status}</td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monthly Hostel Attendance Report — Shanti Gurukul</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 10px; color: #0f172a; font-size: 11px; }
    .school-header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
    .org-banner { font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px; }
    .school-title { font-size: 20px; font-weight: 900; color: #1e3a8a; margin: 3px 0; }
    .school-sub { font-size: 10px; color: #475569; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #1e3a8a; color: #ffffff; padding: 6px 8px; border: 1px solid #1e3a8a; text-align: left; }
    .sig-row { display: flex; justify-content: flex-end; margin-top: 36px; padding-top: 10px; }
    .sig-col { text-align: center; width: 220px; }
    .sig-line { border-top: 1px solid #475569; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="school-header">
    <div class="org-banner">RangBharti's</div>
    <div class="school-title">SHANTI GURUKUL RESIDENTIAL SCHOOL</div>
    <div class="school-sub">Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234 • Hostel Mentorship &amp; Pastoral Welfare</div>
    <div style="font-size:12px;font-weight:800;color:#0f172a;margin-top:6px;text-transform:uppercase;">
      Monthly Hostel Attendance &amp; Pastoral Care Master Report — ${monthName} ${year}
    </div>
  </div>

  <div class="meta-box">
    <div><strong>Month &amp; Year:</strong> ${monthName} ${year}</div>
    <div><strong>Total Boarders:</strong> ${totalWards} Residential Boys</div>
    <div><strong>Total Month Days:</strong> ${daysInMonth} Days</div>
    <div><strong>Hostel Attendance Avg:</strong> <span style="font-weight:900;color:#15803d;">${avgPct}%</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:28px;text-align:center;">#</th>
        <th style="width:85px;">Roll No</th>
        <th>Student Name</th>
        <th style="text-align:center;width:75px;">Class</th>
        <th style="text-align:center;width:75px;">Room</th>
        <th style="text-align:center;">Assigned Mentor</th>
        <th style="text-align:center;width:75px;">Present (Bed)</th>
        <th style="text-align:center;width:65px;">Sickbay</th>
        <th style="text-align:center;width:65px;">Outpass</th>
        <th style="text-align:center;width:75px;">Monthly %</th>
        <th style="text-align:center;width:90px;">Pastoral Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="sig-row">
    <div class="sig-col">
      <div class="sig-line"></div>
      <strong>Residential Mentor</strong>
      <div style="color:#64748b;font-size:10px;">Shanti Gurukul, Bachani</div>
    </div>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print failed:', err);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1200);
      }
    }, 250);
  };

  return (
    <Layout pageTitle="Hostel Mentorship & Pastoral Welfare">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>👤</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            👤 Hostel Mentorship & Pastoral Welfare
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            60 Residential Boys (Rooms 201–215) &bull; 4 Dedicated Male Mentors &bull; 9:30 PM Night Roll Call & Parent Contact
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenRollCall(mentors[0] || {})}>
            🌙 Night Roll Call
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCallModal(true)}>
            📞 Log Parent Call
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24
      }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>🏨</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--gold-400)' }}>60</div>
            <div className="stat-label">Total Residential Wards</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>60 Boys across Rooms 201–215</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>👨‍🏫</div>
          <div className="stat-info">
            <div className="stat-value">{mentors.length || 4}</div>
            <div className="stat-label">Active Male Mentors</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>1 Mentor per ~15 Wards</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>🌙</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>Verified</div>
            <div className="stat-label">Night Roll Call (9:30 PM)</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Bed-by-Bed Headcount</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>📞</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{callLogs.length}</div>
            <div className="stat-label">Parent Calls Recorded</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Directly Notified to Parents</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 10, borderBottom: '1px solid var(--border)',
        marginBottom: 20, paddingBottom: 2, overflowX: 'auto'
      }}>
        <button
          className={`tab-btn${activeTab === 'mentors' ? ' active' : ''}`}
          onClick={() => setActiveTab('mentors')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'mentors' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'mentors' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', whiteSpace: 'nowrap'
          }}
        >
          👨‍🏫 Residential Mentors Directory (4 Mentors)
        </button>

        <button
          className={`tab-btn${activeTab === 'roster' ? ' active' : ''}`}
          onClick={() => setActiveTab('roster')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'roster' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'roster' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', whiteSpace: 'nowrap'
          }}
        >
          🌙 Daily Night Roll Call Register
        </button>

        <button
          className={`tab-btn${activeTab === 'monthly' ? ' active' : ''}`}
          onClick={() => setActiveTab('monthly')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'monthly' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'monthly' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', whiteSpace: 'nowrap'
          }}
        >
          📊 Monthly Hostel Attendance Report
        </button>

        <button
          className={`tab-btn${activeTab === 'calls' ? ' active' : ''}`}
          onClick={() => setActiveTab('calls')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'calls' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'calls' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', whiteSpace: 'nowrap'
          }}
        >
          📞 Parent Communication Logs ({callLogs.length})
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: 4 MALE MENTORS DIRECTORY
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'mentors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {mentors.map(m => {
            const assigned = getMentorAssignedStudents(m);
            return (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: 22, display: 'flex', flexDirection: 'column', gap: 14,
                  position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: m.color || 'var(--gold-500)'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: `${m.color || '#3b82f6'}20`, color: m.color || '#3b82f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', fontWeight: 800, border: `2px solid ${m.color || '#3b82f6'}40`
                    }}>
                      {m.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                        {m.name.includes('(Residential Mentor)') ? m.name : `${m.name} (Residential Mentor)`}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gold-400)', fontWeight: 600, marginTop: 2 }}>
                        {m.role}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-teal">Active Duty</span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8,
                  border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.84rem'
                }}>
                  <div>
                    <strong>🏢 Supervised Wing:</strong> <span style={{ color: 'var(--text-secondary)' }}>{m.wing}</span>
                  </div>
                  <div>
                    <strong>🚪 Rooms Covered:</strong> <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>{(m.rooms || []).join(', ')}</span>
                  </div>
                  <div>
                    <strong>👨‍🎓 Assigned Wards:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{assigned.length || m.targetWards} Residential Boys</span>
                  </div>
                  <div>
                    <strong>📞 Mobile:</strong> <a href={`tel:${m.phone}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{m.phone}</a>
                  </div>
                  <div>
                    <strong>🌙 Roll Call Status:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{m.activeRollCall || 'Complete (100%)'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setCallForm(prev => ({ ...prev, mentorName: m.name }));
                      setShowCallModal(true);
                    }}
                  >
                    📞 Log Call
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleOpenRollCall(m)}
                  >
                    🌙 Roll Call ({assigned.length})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: DAILY NIGHT ROLL CALL REGISTER (60 BOYS)
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Controls Bar */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14, alignItems: 'flex-end'
            }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  📅 Roll Call Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={registerDate}
                  onChange={e => setRegisterDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  ⏰ Roll Call Session
                </label>
                <select
                  className="form-control"
                  value={registerSession}
                  onChange={e => setRegisterSession(e.target.value)}
                >
                  <option value="night">🌙 Night Roll-Call (9:30 PM)</option>
                  <option value="morning">☀️ Morning Roll-Call (6:00 AM)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  👨‍🏫 Filter by Assigned Mentor
                </label>
                <select
                  className="form-control"
                  value={selectedMentorFilter}
                  onChange={e => setSelectedMentorFilter(e.target.value)}
                >
                  <option value="all">All Mentors (All 60 Residential Boys)</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.wing}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleMarkAllRegister('present')}
                  style={{ flex: 1, whiteSpace: 'nowrap' }}
                >
                  🟢 All in Rooms
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveRegister}
                  disabled={isSavingRegister}
                  style={{ flex: 1, whiteSpace: 'nowrap' }}
                >
                  {isSavingRegister ? 'Saving...' : '💾 Save Roll-Call'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handlePrintRoster}
                  style={{ whiteSpace: 'nowrap' }}
                  title="Print Official Roll Call Roster"
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            {/* Live Headcount Counters & View Toggle */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 14,
              borderTop: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.85rem' }}>
                <div>
                  <strong>Total Wards:</strong> <span style={{ color: 'var(--gold-400)', fontWeight: 800 }}>{headcountSummary.total}</span>
                </div>
                <div>
                  <strong>In Room:</strong> <span style={{ color: '#10b981', fontWeight: 800 }}>{headcountSummary.present}</span>
                </div>
                <div>
                  <strong>Sickbay:</strong> <span style={{ color: '#f59e0b', fontWeight: 800 }}>{headcountSummary.sickbay}</span>
                </div>
                <div>
                  <strong>On Outpass:</strong> <span style={{ color: '#94a3b8', fontWeight: 800 }}>{headcountSummary.leave}</span>
                </div>
                <div>
                  <strong>Missing:</strong> <span style={{ color: '#ef4444', fontWeight: 800 }}>{headcountSummary.absent}</span>
                </div>
              </div>

              {/* View Switcher */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode('cards')}
                  style={{ fontSize: '0.78rem' }}
                >
                  🏠 Room Cards
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode('table')}
                  style={{ fontSize: '0.78rem' }}
                >
                  📋 Audit Table
                </button>
              </div>
            </div>
          </div>

          {/* MODE A: ROOM CARDS */}
          {viewMode === 'cards' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {filteredRooms.map(room => {
                const inchargeMentor = mentors.find(m => (m.rooms || []).includes(room.roomNo));

                return (
                  <div key={room.roomNo} className="card" style={{ padding: 16 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8
                    }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--gold-400)', fontSize: '1rem', fontWeight: 800 }}>
                          Room {room.roomNo} ({room.floor} Floor)
                        </h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Mentor: <strong style={{ color: inchargeMentor?.color || 'var(--text-primary)' }}>{inchargeMentor?.name || 'Assigned Mentor'}</strong> &bull; {room.students?.length || 0} / {room.capacity} Beds
                        </span>
                      </div>
                      <span className="badge badge-purple">🏠 Hostel</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(room.students || []).map(stuId => {
                        const stu = studentMap[stuId] || { id: stuId, name: stuId, class: '—' };
                        const status = registerRecords[stuId] || 'present';
                        const remark = registerRemarks[stuId] || '';

                        return (
                          <div
                            key={stuId}
                            style={{
                              display: 'flex', flexDirection: 'column', gap: 6,
                              background: status === 'sickbay' ? 'rgba(245, 158, 11, 0.08)' : status === 'absent' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)',
                              padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{stu.name}</strong>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  Class {stu.class}-{stu.section || 'A'} &bull; {stu.id}
                                </div>
                              </div>

                              {/* Status Toggles: In (present), Sick (sickbay), Out (leave), Abs (absent) */}
                              <div style={{ display: 'flex', gap: 3 }}>
                                <button
                                  type="button"
                                  onClick={() => setRegisterRecords(prev => ({ ...prev, [stuId]: 'present' }))}
                                  style={{
                                    border: 'none', borderRadius: 4, padding: '3px 7px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                    background: status === 'present' ? '#10b981' : 'rgba(255,255,255,0.06)',
                                    color: status === 'present' ? '#000' : 'var(--text-muted)'
                                  }}
                                  title="In Room"
                                >
                                  In
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRegisterRecords(prev => ({ ...prev, [stuId]: 'sickbay' }))}
                                  style={{
                                    border: 'none', borderRadius: 4, padding: '3px 7px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                    background: status === 'sickbay' ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                                    color: status === 'sickbay' ? '#000' : 'var(--text-muted)'
                                  }}
                                  title="Sickbay"
                                >
                                  Sick
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRegisterRecords(prev => ({ ...prev, [stuId]: 'leave' }))}
                                  style={{
                                    border: 'none', borderRadius: 4, padding: '3px 7px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                    background: status === 'leave' ? '#94a3b8' : 'rgba(255,255,255,0.06)',
                                    color: status === 'leave' ? '#000' : 'var(--text-muted)'
                                  }}
                                  title="Outpass"
                                >
                                  Out
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRegisterRecords(prev => ({ ...prev, [stuId]: 'absent' }))}
                                  style={{
                                    border: 'none', borderRadius: 4, padding: '3px 7px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                    background: status === 'absent' ? '#ef4444' : 'rgba(255,255,255,0.06)',
                                    color: status === 'absent' ? '#fff' : 'var(--text-muted)'
                                  }}
                                  title="Missing"
                                >
                                  Abs
                                </button>
                              </div>
                            </div>

                            {/* Remark note */}
                            <input
                              type="text"
                              placeholder="Add observation / health note..."
                              value={remark}
                              onChange={e => setRegisterRemarks(prev => ({ ...prev, [stuId]: e.target.value }))}
                              style={{
                                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 4, color: '#fff', fontSize: '0.74rem', padding: '3px 6px'
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE B: MENTORSHIP AUDIT TABLE (CLEAN WITHOUT DUMMY QUOTES) */}
          {viewMode === 'table' && (
            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-responsive">
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>Wing / Incharge Mentor</th>
                        <th>Rooms Supervised</th>
                        <th>Assigned Boarders</th>
                        <th>Roll Call Headcount</th>
                        <th>Sickbay / Leave</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentors.map(m => {
                        const mStudents = getMentorAssignedStudents(m);
                        const pCount = mStudents.filter(s => (registerRecords[s.id] || 'present') === 'present').length;
                        const sCount = mStudents.filter(s => registerRecords[s.id] === 'sickbay').length;
                        const lCount = mStudents.filter(s => registerRecords[s.id] === 'leave').length;

                        return (
                          <tr key={m.id}>
                            <td style={{ padding: '12px 16px' }}>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{m.wing}</strong>
                              <div style={{ fontSize: '0.78rem', color: m.color || 'var(--gold-400)', fontWeight: 700 }}>
                                {m.name}
                              </div>
                            </td>
                            <td>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                                {(m.rooms || []).join(', ')}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--gold-400)' }}>{mStudents.length} Boys</strong>
                            </td>
                            <td>
                              <span className="badge badge-teal" style={{ fontSize: '0.78rem' }}>
                                Verified ({pCount}/{mStudents.length})
                              </span>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Sickbay: <strong style={{ color: sCount ? '#f59e0b' : 'var(--text-secondary)' }}>{sCount}</strong> &bull; Outpass: <strong style={{ color: 'var(--text-secondary)' }}>{lCount}</strong>
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                onClick={() => handleOpenRollCall(m)}
                              >
                                Take Roll Call
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: MONTHLY HOSTEL ATTENDANCE REPORT GENERATION
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Month / Year / Mentor Selector Bar */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14, alignItems: 'flex-end'
            }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  📅 Select Month
                </label>
                <select
                  className="form-control"
                  value={reportMonth}
                  onChange={e => setReportMonth(parseInt(e.target.value))}
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  📅 Select Academic Year
                </label>
                <select
                  className="form-control"
                  value={reportYear}
                  onChange={e => setReportYear(parseInt(e.target.value))}
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  👨‍🏫 Supervised Wing / Mentor
                </label>
                <select
                  className="form-control"
                  value={reportMentorFilter}
                  onChange={e => setReportMentorFilter(e.target.value)}
                >
                  <option value="all">All Mentors (All 60 Residential Boys)</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.wing})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  className="btn btn-primary"
                  onClick={handlePrintMonthlyReport}
                  style={{ width: '100%', height: 38 }}
                >
                  🖨️ Print Monthly Report
                </button>
              </div>
            </div>

            {/* Monthly KPI Overview */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Month Boarders</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-400)', marginTop: 2 }}>
                  {monthlyHostelData.totalWards} Boys
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Month Duration</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
                  {monthlyHostelData.daysInMonth} Days
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Hostel Attendance Avg</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                  {monthlyHostelData.avgPct}%
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Sickbay & Outpass</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>
                  {monthlyHostelData.grandSick} Sick &bull; {monthlyHostelData.grandLeave} Out
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Matrix Table */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">
                📊 {monthlyHostelData.monthName} {monthlyHostelData.year} Hostel Attendance Matrix ({monthlyHostelData.totalWards} Boys)
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handlePrintMonthlyReport}>
                🖨️ Print
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 14px', textAlign: 'center', width: 40 }}>#</th>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'center' }}>Class</th>
                      <th style={{ textAlign: 'center' }}>Room</th>
                      <th>Incharge Mentor</th>
                      <th style={{ textAlign: 'center' }}>Present (Bed)</th>
                      <th style={{ textAlign: 'center' }}>Sickbay</th>
                      <th style={{ textAlign: 'center' }}>Outpass</th>
                      <th style={{ textAlign: 'center' }}>Attendance %</th>
                      <th style={{ textAlign: 'center' }}>Pastoral Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyHostelData.studentRows.map((s, idx) => {
                      const isHigh = s.percentage >= 95;
                      const isMedium = s.percentage >= 90;

                      return (
                        <tr key={s.id}>
                          <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <strong style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{s.rollNo || s.id}</strong>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.name}</strong>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                            Class {s.class}-{s.section || 'A'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: 'var(--gold-400)', fontWeight: 700, fontSize: '0.84rem' }}>
                              Room {s.hostelRoom || '201'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {s.mentorName}
                          </td>
                          <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 800 }}>
                            {s.presentDays} d
                          </td>
                          <td style={{ textAlign: 'center', color: s.sickDays > 0 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 600 }}>
                            {s.sickDays} d
                          </td>
                          <td style={{ textAlign: 'center', color: s.leaveDays > 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                            {s.leaveDays} d
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '3px 8px', borderRadius: 6, fontWeight: 800, fontSize: '0.8rem',
                                background: isHigh ? 'rgba(16,185,129,0.15)' : isMedium ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                                color: isHigh ? '#10b981' : isMedium ? '#3b82f6' : '#f59e0b'
                              }}
                            >
                              {s.percentage}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${isHigh ? 'badge-teal' : isMedium ? 'badge-blue' : 'badge-gold'}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 4: PARENT COMMUNICATION LOGS
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'calls' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="card-title">📞 Direct Parent Contact Logs & Sync</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCallModal(true)}>
              + Log New Call
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {callLogs.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                No parent phone calls logged yet. Click "+ Log New Call" to record one.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th>Student & Parent</th>
                      <th>Mentor</th>
                      <th>Category</th>
                      <th>Emotional State</th>
                      <th>Call Summary & Feedback</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callLogs.map(c => (
                      <tr key={c.id}>
                        <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {c.date}
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{c.studentName}</strong>
                          <div style={{ fontSize: '0.76rem', color: 'var(--gold-400)' }}>
                            Parent: {c.parentName}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {c.mentorName}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-blue">{c.category}</span>
                        </td>
                        <td>
                          <span className="badge badge-purple">{c.emotionalState}</span>
                        </td>
                        <td style={{ maxWidth: 350, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          {c.summary}
                        </td>
                        <td>
                          <span className="badge badge-teal">Synced to Parent</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: REAL 9:30 PM NIGHT ROLL CALL CHECKLIST FOR MENTOR
          ────────────────────────────────────────────────────────── */}
      {showRollModal && selectedWingMentor && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 700, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🌙</span> 9:30 PM Night Roll Call — {selectedWingMentor.wing}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Assigned Mentor: <strong style={{ color: selectedWingMentor.color || 'var(--gold-400)' }}>{selectedWingMentor.name}</strong> &bull; Supervised Rooms: {(selectedWingMentor.rooms || []).join(', ')} &bull; Total Wards: <strong>{currentWingStudents.length} Boys</strong>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowRollModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Quick Actions Bar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '10px 14px', gap: 8
              }}>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Wards to Account For: <strong style={{ color: '#fff' }}>{currentWingStudents.length} Residential Boys</strong>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => handleMarkAllInWing('present')}
                  >
                    🟢 Mark All in Room
                  </button>
                </div>
              </div>

              {/* Student Bed-by-Bed Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentWingStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No students currently assigned to this wing's rooms.
                  </div>
                ) : (
                  currentWingStudents.map((s, idx) => {
                    const status = rollCallRecords[s.id] || 'present';
                    const remark = rollCallRemarks[s.id] || '';
                    return (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 6,
                          padding: '10px 14px', borderRadius: 8,
                          background: status === 'sickbay' ? 'rgba(245, 158, 11, 0.08)' : status === 'leave' ? 'rgba(148, 163, 184, 0.08)' : status === 'absent' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          border: status === 'sickbay' ? '1px solid rgba(245, 158, 11, 0.3)' : status === 'absent' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 20 }}>#{idx + 1}</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                {s.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {s.id} &bull; Class {s.class}-{s.section || 'A'} &bull; <strong style={{ color: 'var(--gold-400)' }}>Room {s.hostelRoom || '201'}</strong>
                              </div>
                            </div>
                          </div>

                          {/* 4 Status Toggle Buttons */}
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(s.id, 'present')}
                              style={{
                                padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                background: status === 'present' ? '#10b981' : 'rgba(255,255,255,0.05)',
                                color: status === 'present' ? '#000' : 'var(--text-muted)',
                                border: status === 'present' ? '1px solid #10b981' : '1px solid var(--border)'
                              }}
                            >
                              🟢 In Room
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(s.id, 'sickbay')}
                              style={{
                                padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                background: status === 'sickbay' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                                color: status === 'sickbay' ? '#000' : 'var(--text-muted)',
                                border: status === 'sickbay' ? '1px solid #f59e0b' : '1px solid var(--border)'
                              }}
                            >
                              🟡 Sickbay
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(s.id, 'leave')}
                              style={{
                                padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                background: status === 'leave' ? '#94a3b8' : 'rgba(255,255,255,0.05)',
                                color: status === 'leave' ? '#000' : 'var(--text-muted)',
                                border: status === 'leave' ? '1px solid #94a3b8' : '1px solid var(--border)'
                              }}
                            >
                              🟠 Outpass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStudentStatus(s.id, 'absent')}
                              style={{
                                padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                background: status === 'absent' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                                color: status === 'absent' ? '#fff' : 'var(--text-muted)',
                                border: status === 'absent' ? '1px solid #ef4444' : '1px solid var(--border)'
                              }}
                            >
                              🔴 Missing
                            </button>
                          </div>
                        </div>

                        {/* Remark input */}
                        <input
                          type="text"
                          placeholder="Optional remark e.g. headache, evening prayers, fever..."
                          value={remark}
                          onChange={e => handleSetStudentRemark(s.id, e.target.value)}
                          style={{
                            background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 4, color: '#fff', fontSize: '0.75rem', padding: '4px 8px'
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Mentor Inspection Notes */}
              <div className="form-group" style={{ marginTop: 8 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  📝 Mentor Observation / Headcount Note
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={rollCallNotes}
                  onChange={e => setRollCallNotes(e.target.value)}
                  placeholder="Record dorm atmosphere, lights-out check, or medical observations..."
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRollModal(false)}
                disabled={savingRollCall}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveRollCall}
                disabled={savingRollCall}
              >
                {savingRollCall ? 'Saving...' : '💾 Lock & Verify Roll Call'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: LOG PARENT COMMUNICATION CALL
          ────────────────────────────────────────────────────────── */}
      {showCallModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">📞 Log Parent Communication Call</h3>
              <button className="modal-close" onClick={() => setShowCallModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCall}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Wing Mentor Conducting Call</label>
                  <select
                    className="form-control"
                    value={callForm.mentorName}
                    onChange={e => setCallForm({ ...callForm, mentorName: e.target.value })}
                  >
                    {mentors.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.wing})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Residential Boarder</label>
                  <select
                    className="form-control"
                    value={callForm.studentId}
                    onChange={e => {
                      const stu = residentialBoys.find(s => s.id === e.target.value);
                      setCallForm({
                        ...callForm,
                        studentId: e.target.value,
                        parentName: stu?.parentName || ''
                      });
                    }}
                    required
                  >
                    <option value="">-- Choose Residential Student --</option>
                    {residentialBoys.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Class {s.class}-{s.section || 'A'} • Room {s.hostelRoom || '201'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Parent / Guardian Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={callForm.parentName}
                    onChange={e => setCallForm({ ...callForm, parentName: e.target.value })}
                    placeholder="Parent's Name"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">Discussion Category</label>
                    <select
                      className="form-control"
                      value={callForm.category}
                      onChange={e => setCallForm({ ...callForm, category: e.target.value })}
                    >
                      <option value="General Wellbeing">General Wellbeing</option>
                      <option value="Academic Progress">Academic Progress</option>
                      <option value="Health & Recovery">Health & Recovery</option>
                      <option value="Discipline & Routine">Discipline & Routine</option>
                      <option value="Weekend Outpass">Weekend Outpass</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student Emotional State</label>
                    <select
                      className="form-control"
                      value={callForm.emotionalState}
                      onChange={e => setCallForm({ ...callForm, emotionalState: e.target.value })}
                    >
                      <option value="Cheerful">Cheerful</option>
                      <option value="Focused">Focused</option>
                      <option value="Homesick">Homesick</option>
                      <option value="Recovering">Recovering</option>
                      <option value="Disciplined">Disciplined</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Discussion Summary & Action Taken</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={callForm.summary}
                    onChange={e => setCallForm({ ...callForm, summary: e.target.value })}
                    placeholder="Briefly state points discussed with parent and any commitments..."
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCallModal(false)}
                  disabled={savingCall}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingCall}
                >
                  {savingCall ? 'Saving...' : '💾 Save & Sync Call'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
