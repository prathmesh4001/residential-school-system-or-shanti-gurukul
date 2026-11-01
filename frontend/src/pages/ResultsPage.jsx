/* ============================================================
   ResultsPage.jsx — Full React port of results.html + results.js
   Features:
     - 3 Tabs:
       1. Enter Marks: Class/Section/Exam/Year selection, responsive marks table,
          live auto-calculation of totals, percentages and grades, bulk save to backend
       2. View Results: Search student, view comprehensive marksheet, pass/fail status,
          quick launch of official report card
       3. Class Analysis: Class topper highlight, pass rate progress bar, class average,
          ranked student leaderboard with medals and direct report card triggers
     - Printable Official Progress Report Card modal with school branding & signatures
   ============================================================ */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

/* ── Toast Hook ── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return { toasts, show };
}

const EXAMS = ['Unit Test 1', 'Unit Test 2', 'Half Yearly', 'Annual Exam'];

function getSubjectsForClass(cls) {
  if (Number(cls) >= 9) {
    return ['Marathi', 'Hindi', 'English', 'History', 'Geography', 'Science', 'Algebra', 'Geometry', 'Sports'];
  }
  return ['Marathi', 'Hindi', 'English', 'History', 'Geography', 'Science', 'Maths', 'Sports'];
}

function calculateGrade(pct) {
  if (pct >= 90) return { grade: 'A+', remark: 'Excellent', color: 'var(--success)' };
  if (pct >= 75) return { grade: 'A', remark: 'Very Good', color: 'var(--success)' };
  if (pct >= 60) return { grade: 'B', remark: 'Good', color: 'var(--blue-400)' };
  if (pct >= 45) return { grade: 'C', remark: 'Average', color: 'var(--gold-400)' };
  if (pct >= 33) return { grade: 'D', remark: 'Below Average', color: 'var(--warning)' };
  return { grade: 'F', remark: 'Fail', color: 'var(--danger)' };
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function ResultsPage() {
  const { user } = useAuth();
  const { toasts, show: toast } = useToast();

  // Active Tab: 'enter' | 'view' | 'analysis'
  const [activeTab, setActiveTab] = useState('enter');

  // Shared Data
  const [allStudents, setAllStudents] = useState([]);
  const [allResults, setAllResults] = useState([]);

  // Tab 1: Enter Marks State
  const [enterExam, setEnterExam] = useState('Half Yearly');
  const [enterClass, setEnterClass] = useState('6');
  const [enterSection, setEnterSection] = useState('A');
  const [enterYear, setEnterYear] = useState('2026');
  const [classStudents, setClassStudents] = useState([]);
  const [marksGrid, setMarksGrid] = useState({}); // { [studentId]: { [subject]: number } }
  const [entryMode, setEntryMode] = useState('direct'); // 'direct' | 'subjects'
  const [directMaxMarks, setDirectMaxMarks] = useState(() => getSubjectsForClass('6').length * 100);
  const [directMarksGrid, setDirectMarksGrid] = useState({}); // { [studentId]: number | '' }
  const [isLoadingClass, setIsLoadingClass] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);

  useEffect(() => {
    setDirectMaxMarks(getSubjectsForClass(enterClass).length * 100);
  }, [enterClass]);

  // Tab 2: View Results State
  const [viewSearch, setViewSearch] = useState('');
  const [viewExam, setViewExam] = useState('Half Yearly');
  const [viewYear, setViewYear] = useState('2026');

  // Tab 3: Class Analysis State
  const [anaClass, setAnaClass] = useState('6');
  const [anaSection, setAnaSection] = useState('A');
  const [anaExam, setAnaExam] = useState('Half Yearly');
  const [anaYear, setAnaYear] = useState('2026');

  // Modal: Report Card
  const [reportCardStudent, setReportCardStudent] = useState(null);
  const [reportCardResult, setReportCardResult] = useState(null);
  const [reportCardRank, setReportCardRank] = useState(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // ──────────────────────────────────────────────────────────
  // Fetch initial students and results
  // ──────────────────────────────────────────────────────────
  const fetchBaseData = useCallback(async () => {
    try {
      const [stuRes, resRes] = await Promise.all([
        api.get('/students'),
        api.get('/results')
      ]);
      setAllStudents(stuRes.data || []);
      setAllResults(resRes.data || []);
    } catch (err) {
      console.error(err);
      toast('Failed to load examination data', 'error');
    }
  }, [toast]);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  // Lookup map
  const studentMap = useMemo(() => {
    const map = {};
    allStudents.forEach(s => { map[s.id] = s; });
    return map;
  }, [allStudents]);

  // ──────────────────────────────────────────────────────────
  // 1. Load Marks Entry for Class
  // ──────────────────────────────────────────────────────────
  const loadMarksEntry = useCallback(async () => {
    if (!enterClass || !enterSection) {
      toast('Please choose class and section', 'warning');
      return;
    }
    setIsLoadingClass(true);
    try {
      const filtered = allStudents.filter(
        s => String(s.class) === String(enterClass) && s.section === enterSection
      );
      setClassStudents(filtered);

      // Load existing results for this class from backend
      const res = await api.get('/results/class', {
        params: { cls: enterClass, section: enterSection, exam: enterExam, year: enterYear }
      });
      const existingList = res.data || [];

      const newGrid = {};
      const newDirectGrid = {};
      filtered.forEach(s => {
        const found = existingList.find(r => r.studentId === s.id);
        newGrid[s.id] = found && found.subjects ? { ...found.subjects } : {};
        newDirectGrid[s.id] = found && found.total !== undefined ? found.total : '';
      });

      setMarksGrid(newGrid);
      setDirectMarksGrid(newDirectGrid);
    } catch (err) {
      console.error(err);
      toast('Failed to load marks grid', 'error');
    } finally {
      setIsLoadingClass(false);
    }
  }, [allStudents, enterClass, enterSection, enterExam, enterYear, toast]);

  // Initial load for tab 1
  useEffect(() => {
    if (allStudents.length > 0 && classStudents.length === 0) {
      loadMarksEntry();
    }
  }, [allStudents, classStudents.length, loadMarksEntry]);

  // Handle single subject mark change
  const handleMarkChange = (studentId, subject, val) => {
    const num = val === '' ? '' : Math.min(100, Math.max(0, Number(val)));
    setMarksGrid(prev => {
      const updated = {
        ...(prev[studentId] || {}),
        [subject]: num
      };
      // Auto-compute total for direct marks grid
      let sum = 0;
      let hasAny = false;
      Object.values(updated).forEach(v => {
        if (v !== '' && v !== undefined) {
          sum += Number(v);
          hasAny = true;
        }
      });
      if (hasAny) {
        setDirectMarksGrid(d => ({ ...d, [studentId]: sum }));
      }
      return {
        ...prev,
        [studentId]: updated
      };
    });
  };

  // Handle direct total mark change for a student
  const handleDirectMarkChange = (studentId, val) => {
    const maxVal = Number(directMaxMarks) || 1000;
    const num = val === '' ? '' : Math.max(0, Math.min(maxVal, Number(val)));
    setDirectMarksGrid(prev => ({
      ...prev,
      [studentId]: num
    }));
  };

  // Save all marks (Subject-wise or Direct)
  const handleSaveAllMarks = async () => {
    if (classStudents.length === 0) return;
    setIsSavingMarks(true);
    const subjects = getSubjectsForClass(enterClass);
    try {
      let savedCount = 0;
      for (const s of classStudents) {
        const studentMarks = marksGrid[s.id] || {};
        const directMarkVal = directMarksGrid[s.id];
        const hasDirect = directMarkVal !== '' && directMarkVal !== undefined && directMarkVal !== null;
        const hasSubjectMarks = Object.values(studentMarks).some(m => m !== '' && m !== undefined);

        if (hasDirect || hasSubjectMarks) {
          let payload = {
            studentId: s.id,
            class: enterClass,
            section: enterSection,
            exam: enterExam,
            year: enterYear,
          };

          if (entryMode === 'direct' || (hasDirect && !hasSubjectMarks)) {
            const tot = Number(directMarkVal);
            const maxTot = Number(directMaxMarks) || (subjects.length * 100);
            const pct = maxTot > 0 ? Math.round((tot / maxTot) * 10000) / 100 : 0;
            const gi = calculateGrade(pct);
            payload = {
              ...payload,
              total: tot,
              maxTotal: maxTot,
              percentage: pct,
              grade: gi.grade,
              remark: gi.remark,
              pass: pct >= 33,
              subjects: studentMarks
            };
          } else {
            let totalMarks = 0;
            subjects.forEach(sub => {
              if (studentMarks[sub] !== '' && studentMarks[sub] !== undefined) {
                totalMarks += Number(studentMarks[sub]);
              }
            });
            const maxTot = subjects.length * 100;
            const pct = maxTot > 0 ? Math.round((totalMarks / maxTot) * 10000) / 100 : 0;
            const gi = calculateGrade(pct);
            payload = {
              ...payload,
              subjects: studentMarks,
              total: totalMarks,
              maxTotal: maxTot,
              percentage: pct,
              grade: gi.grade,
              remark: gi.remark,
              pass: pct >= 33
            };
          }

          await api.post('/results', payload);
          savedCount++;
        }
      }

      toast(`✅ Successfully saved exam marks for ${savedCount} students!`);
      fetchBaseData();
    } catch (err) {
      console.error(err);
      toast('Failed to save examination marks', 'error');
    } finally {
      setIsSavingMarks(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // 2. Open Report Card
  // ──────────────────────────────────────────────────────────
  const openReportCard = (student, result) => {
    const stu = student || studentMap[result?.studentId] || (result ? {
      id: result.studentId,
      name: result.name || result.studentName || result.studentId,
      class: result.class || enterClass,
      section: result.section || enterSection,
      type: result.type || 'residential'
    } : null);

    if (!stu || !result) {
      toast('No result record available for report card', 'warning');
      return;
    }

    // Calculate rank in class
    const classResults = allResults.filter(
      r => String(r.class) === String(stu.class) &&
           r.section === stu.section &&
           r.exam === result.exam &&
           String(r.year) === String(result.year)
    ).sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

    const rankIdx = classResults.findIndex(r => r.studentId === stu.id);
    const rank = rankIdx !== -1 ? rankIdx + 1 : 1;

    setReportCardStudent(stu);
    setReportCardResult(result);
    setReportCardRank(rank);
    setShowReportCardModal(true);
  };

  // ──────────────────────────────────────────────────────────
  // Filtered Results for View Tab
  // ──────────────────────────────────────────────────────────
  const viewedStudents = useMemo(() => {
    const q = viewSearch.trim().toLowerCase();
    if (!q) return [];
    return allStudents.filter(
      s => s.name?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [allStudents, viewSearch]);

  // ──────────────────────────────────────────────────────────
  // Class Analysis Metrics
  // ──────────────────────────────────────────────────────────
  const analysisResults = useMemo(() => {
    return allResults.filter(
      r => String(r.class) === String(anaClass) &&
           r.section === anaSection &&
           r.exam === anaExam &&
           String(r.year) === String(anaYear)
    ).sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  }, [allResults, anaClass, anaSection, anaExam, anaYear]);

  const anaStudents = useMemo(() => {
    return allStudents.filter(
      s => String(s.class) === String(anaClass) && s.section === anaSection
    );
  }, [allStudents, anaClass, anaSection]);

  const analysisStats = useMemo(() => {
    if (analysisResults.length === 0) {
      return { total: anaStudents.length, passed: 0, failed: 0, avg: 0, topper: null };
    }
    const passed = analysisResults.filter(r => r.pass).length;
    const failed = anaStudents.length - passed;
    const avg = Math.round(
      analysisResults.reduce((s, r) => s + (r.percentage || 0), 0) / analysisResults.length * 10
    ) / 10;
    const topper = analysisResults[0] || null;

    return { total: anaStudents.length, passed, failed, avg, topper };
  }, [analysisResults, anaStudents]);

  const currentSubjects = getSubjectsForClass(enterClass);

  return (
    <Layout title="Exam Results & Report Cards" currentModule="results">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : '✅'}</span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      <div className="page-content" style={{ padding: '24px 32px' }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div>
            <div className="page-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.8rem' }}>📝</span> Examination Results
            </div>
            <div className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              Enter subject-wise student marks, generate printable report cards, and evaluate class performance
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tabs" style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          <button
            className={`tab-btn ${activeTab === 'enter' ? 'active' : ''}`}
            onClick={() => setActiveTab('enter')}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'enter' ? 'var(--navy-800)' : 'transparent',
              color: activeTab === 'enter' ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'enter' ? '2px solid var(--gold-400)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>✏️</span> Enter Marks
          </button>

          <button
            className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'view' ? 'var(--navy-800)' : 'transparent',
              color: activeTab === 'view' ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'view' ? '2px solid var(--gold-400)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>👁️</span> View Student Results
          </button>

          <button
            className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeTab === 'analysis' ? 'var(--navy-800)' : 'transparent',
              color: activeTab === 'analysis' ? 'var(--gold-400)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: activeTab === 'analysis' ? '2px solid var(--gold-400)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <span>📊</span> Class Analysis &amp; Toppers
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            TAB 1: ENTER MARKS
            ══════════════════════════════════════════════════════ */}
        {activeTab === 'enter' && (
          <div>
            {/* Filter Bar */}
            <div
              className="card"
              style={{
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                background: 'var(--navy-800)',
                border: '1px solid var(--border)',
                borderRadius: 12
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Exam:</label>
                  <select
                    className="form-control"
                    value={enterExam}
                    onChange={e => setEnterExam(e.target.value)}
                    style={{ width: 160 }}
                  >
                    {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Class:</label>
                  <select
                    className="form-control"
                    value={enterClass}
                    onChange={e => setEnterClass(e.target.value)}
                    style={{ width: 110 }}
                  >
                    {['5', '6', '7', '8', '9', '10'].map(c => (
                      <option key={c} value={c}>{c}th Std</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Section:</label>
                  <select
                    className="form-control"
                    value={enterSection}
                    onChange={e => setEnterSection(e.target.value)}
                    style={{ width: 90 }}
                  >
                    <option value="A">Sec A</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Year:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={enterYear}
                    onChange={e => setEnterYear(e.target.value)}
                    style={{ width: 95 }}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={loadMarksEntry}
                  disabled={isLoadingClass}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {isLoadingClass ? '⏳ Loading...' : '📋 Load Students'}
                </button>
              </div>

              {classStudents.length > 0 && (
                <button
                  className="btn btn-success"
                  onClick={handleSaveAllMarks}
                  disabled={isSavingMarks}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {isSavingMarks ? '💾 Saving...' : '💾 Save All Marks'}
                </button>
              )}
            </div>

            {/* Table Area */}
            {isLoadingClass ? (
              <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <div>Loading students and existing examination records...</div>
              </div>
            ) : classStudents.length === 0 ? (
              <div className="card" style={{ padding: 50, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📝</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>
                  No students in Class {enterClass}-{enterSection}
                </h3>
                <p style={{ fontSize: '0.88rem' }}>Please select another class or section above.</p>
              </div>
            ) : (
              <div className="card" style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '14px 20px',
                    background: 'var(--navy-700)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{enterExam} — Class {enterClass}-{enterSection} | {enterYear}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {entryMode === 'direct'
                        ? '⚡ Direct Mark Mode: Type the total mark directly for each student. Press Enter or ↓ to move to the next student.'
                        : '📊 Subject-Wise Mode: Enter marks per subject (0–100) or enter a direct score in the Total column.'}
                    </div>
                  </div>

                  {/* Mode Selector & Max Total */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', background: 'var(--navy-900)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${entryMode === 'direct' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setEntryMode('direct')}
                        style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6 }}
                      >
                        ⚡ Direct Mark Entry (थेट गुण)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${entryMode === 'subjects' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setEntryMode('subjects')}
                        style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6 }}
                      >
                        📊 Subject-Wise (विषयवार गुण)
                      </button>
                    </div>

                    {entryMode === 'direct' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600 }}>Out of:</span>
                        <input
                          type="number"
                          className="form-control"
                          value={directMaxMarks}
                          onChange={e => setDirectMaxMarks(Math.max(1, Number(e.target.value) || 100))}
                          style={{ width: 75, padding: '4px 8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 700 }}
                          title="Maximum total marks for this examination"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {entryMode === 'direct' ? (
                  /* ── MODE 1: DIRECT TOTAL MARKS TABLE ── */
                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--navy-800)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 14px', width: 50, color: 'var(--text-muted)' }}>#</th>
                          <th style={{ padding: '12px 14px', width: 140 }}>Roll No</th>
                          <th style={{ padding: '12px 14px' }}>Student Name</th>
                          <th style={{ padding: '12px 14px', textAlign: 'center', width: 100 }}>Max Marks</th>
                          <th style={{ padding: '12px 14px', textAlign: 'center', width: 190, color: 'var(--gold-400)' }}>
                            Direct Mark Obtained (थेट गुण)
                          </th>
                          <th style={{ padding: '12px 14px', textAlign: 'center', width: 110 }}>Percentage</th>
                          <th style={{ padding: '12px 14px', textAlign: 'center', width: 95 }}>Grade</th>
                          <th style={{ padding: '12px 14px', textAlign: 'center', width: 100 }}>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((s, idx) => {
                          const val = directMarksGrid[s.id] ?? '';
                          const hasVal = val !== '' && val !== undefined && val !== null;
                          const maxTot = Number(directMaxMarks) || 600;
                          const pct = hasVal ? Math.round((Number(val) / maxTot) * 10000) / 100 : null;
                          const gi = pct !== null ? calculateGrade(pct) : null;

                          return (
                            <tr
                              key={s.id}
                              style={{
                                borderBottom: '1px solid var(--border)',
                                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                              }}
                            >
                              <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--gold-400)', fontSize: '0.88rem' }}>
                                {s.rollNo || s.id}
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {s.name}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                                {maxTot}
                              </td>
                              <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                                <input
                                  id={`direct-mark-${idx}`}
                                  type="number"
                                  min="0"
                                  max={maxTot}
                                  className="form-control"
                                  value={val}
                                  placeholder="उदा. 480"
                                  onFocus={e => e.target.select()}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                      e.preventDefault();
                                      const next = document.getElementById(`direct-mark-${idx + 1}`);
                                      if (next) next.focus();
                                    } else if (e.key === 'ArrowUp') {
                                      e.preventDefault();
                                      const prev = document.getElementById(`direct-mark-${idx - 1}`);
                                      if (prev) prev.focus();
                                    }
                                  }}
                                  onChange={e => handleDirectMarkChange(s.id, e.target.value)}
                                  style={{
                                    width: 140,
                                    padding: '6px 12px',
                                    textAlign: 'center',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: 'var(--gold-400)',
                                    background: 'var(--navy-900)',
                                    margin: '0 auto',
                                    border: '1.5px solid var(--gold-500)',
                                    borderRadius: 6
                                  }}
                                />
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, fontSize: '0.92rem', color: pct !== null ? gi.color : 'var(--text-muted)' }}>
                                {pct !== null ? `${pct}%` : '—'}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                {gi ? (
                                  <span className={`badge ${pct >= 33 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.78rem', padding: '3px 9px' }}>
                                    {gi.grade}
                                  </span>
                                ) : '—'}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                {gi ? (
                                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: pct >= 33 ? 'var(--success)' : 'var(--danger)' }}>
                                    {pct >= 33 ? 'PASS ✓' : 'FAIL ✗'}
                                  </span>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* ── MODE 2: SUBJECT-WISE TABLE ── */
                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
                      <thead>
                        <tr style={{ background: 'var(--navy-800)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 14px', width: 45, color: 'var(--text-muted)' }}>#</th>
                          <th style={{ padding: '12px 14px', width: 130 }}>Roll No</th>
                          <th style={{ padding: '12px 14px', width: 170 }}>Student Name</th>
                          {currentSubjects.map(sub => (
                            <th key={sub} style={{ padding: '12px 10px', textAlign: 'center', minWidth: 70, fontSize: '0.8rem' }}>
                              {sub}
                            </th>
                          ))}
                          <th style={{ padding: '12px 12px', textAlign: 'center', width: 95, color: 'var(--gold-400)' }}>Total Mark</th>
                          <th style={{ padding: '12px 12px', textAlign: 'center', width: 75 }}>%</th>
                          <th style={{ padding: '12px 12px', textAlign: 'center', width: 85 }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((s, idx) => {
                          const marksObj = marksGrid[s.id] || {};
                          let totalMarks = 0;
                          let subjectsFilled = 0;
                          currentSubjects.forEach(sub => {
                            const val = marksObj[sub];
                            if (val !== '' && val !== undefined) {
                              totalMarks += Number(val);
                              subjectsFilled++;
                            }
                          });

                          const directVal = directMarksGrid[s.id];
                          const displayTotal = subjectsFilled > 0 ? totalMarks : (directVal !== '' && directVal !== undefined ? Number(directVal) : '');
                          const maxMarks = currentSubjects.length * 100;
                          const pct = displayTotal !== '' ? Math.round((Number(displayTotal) / maxMarks) * 10000) / 100 : null;
                          const gradeInfo = pct !== null ? calculateGrade(pct) : null;

                          return (
                            <tr
                              key={s.id}
                              style={{
                                borderBottom: '1px solid var(--border)',
                                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                              }}
                            >
                              <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--gold-400)', fontSize: '0.85rem' }}>
                                {s.rollNo || s.id}
                              </td>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {s.name}
                              </td>
                              {currentSubjects.map(sub => {
                                const val = marksObj[sub] ?? '';
                                return (
                                  <td key={sub} style={{ padding: '6px 6px', textAlign: 'center' }}>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      className="form-control"
                                      value={val}
                                      placeholder="—"
                                      onFocus={e => e.target.select()}
                                      onChange={e => handleMarkChange(s.id, sub, e.target.value)}
                                      style={{
                                        width: 58,
                                        padding: '4px 6px',
                                        textAlign: 'center',
                                        fontSize: '0.85rem',
                                        margin: '0 auto'
                                      }}
                                    />
                                  </td>
                                );
                              })}
                              <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                <input
                                  type="number"
                                  min="0"
                                  max={maxMarks}
                                  className="form-control"
                                  value={displayTotal}
                                  placeholder="Direct"
                                  onFocus={e => e.target.select()}
                                  onChange={e => handleDirectMarkChange(s.id, e.target.value)}
                                  style={{
                                    width: 76,
                                    padding: '4px 6px',
                                    textAlign: 'center',
                                    fontSize: '0.88rem',
                                    fontWeight: 800,
                                    color: 'var(--gold-400)',
                                    margin: '0 auto',
                                    border: '1px solid var(--border)'
                                  }}
                                  title="Enter total direct mark or let subjects auto-sum"
                                />
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: pct !== null ? gradeInfo.color : 'var(--text-muted)' }}>
                                {pct !== null ? `${pct}%` : '—'}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                {gradeInfo ? (
                                  <span className={`badge ${pct >= 33 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.72rem' }}>
                                    {gradeInfo.grade}
                                  </span>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div
                  style={{
                    padding: '16px 20px',
                    background: 'var(--navy-800)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Review subject scores and click Save All Marks to record exam results.
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveAllMarks}
                    disabled={isSavingMarks}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {isSavingMarks ? '💾 Saving...' : '💾 Save All Marks'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 2: VIEW STUDENT RESULTS
            ══════════════════════════════════════════════════════ */}
        {activeTab === 'view' && (
          <div>
            {/* Filter Bar */}
            <div
              className="card"
              style={{
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 14,
                background: 'var(--navy-800)',
                border: '1px solid var(--border)',
                borderRadius: 12
              }}
            >
              <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  🔍
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type student name or ID to view result..."
                  value={viewSearch}
                  onChange={e => setViewSearch(e.target.value)}
                  style={{ paddingLeft: 36, width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Exam:</label>
                <select
                  className="form-control"
                  value={viewExam}
                  onChange={e => setViewExam(e.target.value)}
                  style={{ width: 150 }}
                >
                  {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Year:</label>
                <input
                  type="number"
                  className="form-control"
                  value={viewYear}
                  onChange={e => setViewYear(e.target.value)}
                  style={{ width: 95 }}
                />
              </div>
            </div>

            {/* Content Results List */}
            {viewSearch.trim() === '' ? (
              <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Search for a Student</div>
                <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                  Enter student name or roll number above to display their exam marksheet
                </div>
              </div>
            ) : viewedStudents.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No students found matching "{viewSearch}".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {viewedStudents.map(s => {
                  const key = `${s.id}_${viewExam}_${viewYear}`;
                  const result = allResults.find(r => r.key === key || (r.studentId === s.id && r.exam === viewExam && String(r.year) === String(viewYear)));

                  if (!result) {
                    return (
                      <div key={s.id} className="card" style={{ padding: '16px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</span>
                            <span className="badge badge-blue" style={{ marginLeft: 8, fontSize: '0.72rem' }}>
                              Class {s.class}-{s.section}
                            </span>
                            <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.id}</span>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            No result on file for {viewExam} {viewYear}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  const subjectsList = Object.entries(result.subjects || {});

                  return (
                    <div
                      key={s.id}
                      className="card"
                      style={{
                        background: 'var(--navy-800)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          padding: '16px 20px',
                          background: 'var(--navy-700)',
                          borderBottom: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{s.name}</span>
                            <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>Class {s.class}-{s.section}</span>
                            <span className={`badge ${s.type === 'residential' ? 'badge-purple' : 'badge-teal'}`} style={{ fontSize: '0.72rem' }}>
                              {s.type === 'residential' ? '🏠 Residential' : '🚌 Day'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            Roll No: {s.rollNo || s.id} &nbsp;|&nbsp; Examination: {viewExam} {viewYear}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: result.pass ? 'var(--success)' : 'var(--danger)' }}>
                            {result.percentage}%
                          </div>
                          <span className={`badge ${result.pass ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.75rem' }}>
                            {result.grade} — {result.pass ? 'PASS' : 'FAIL'}
                          </span>
                        </div>
                      </div>

                      <div style={{ padding: '16px 20px' }}>
                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                          <thead>
                            <tr style={{ background: 'var(--navy-900)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                              <th style={{ padding: '8px 12px' }}>Subject</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center', width: 90 }}>Max Marks</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center', width: 110 }}>Marks Scored</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center', width: 90 }}>Grade</th>
                              <th style={{ padding: '8px 12px', textAlign: 'center', width: 130 }}>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subjectsList.map(([sub, score]) => {
                              const gi = calculateGrade(Number(score || 0));
                              return (
                                <tr key={sub} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{sub}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>100</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: 'var(--gold-400)' }}>{score}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                    <span className={`badge ${score >= 33 ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                                      {gi.grade}
                                    </span>
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {gi.remark}
                                  </td>
                                </tr>
                              );
                            })}
                            <tr style={{ background: 'rgba(234, 179, 8, 0.08)', fontWeight: 800 }}>
                              <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>TOTAL SCORE</td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>{result.maxTotal}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--gold-400)' }}>{result.total}</td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <span className="badge badge-blue">{result.grade}</span>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', color: result.pass ? 'var(--success)' : 'var(--danger)' }}>
                                {result.percentage}% ({result.remark})
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openReportCard(s, result)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            📄 View Official Report Card
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TAB 3: CLASS ANALYSIS & TOPPERS
            ══════════════════════════════════════════════════════ */}
        {activeTab === 'analysis' && (
          <div>
            {/* Filter Bar */}
            <div
              className="card"
              style={{
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 14,
                background: 'var(--navy-800)',
                border: '1px solid var(--border)',
                borderRadius: 12
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Class:</label>
                <select
                  className="form-control"
                  value={anaClass}
                  onChange={e => setAnaClass(e.target.value)}
                  style={{ width: 110 }}
                >
                  {['5', '6', '7', '8', '9', '10'].map(c => (
                    <option key={c} value={c}>{c}th Std</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Section:</label>
                <select
                  className="form-control"
                  value={anaSection}
                  onChange={e => setAnaSection(e.target.value)}
                  style={{ width: 90 }}
                >
                  <option value="A">Sec A</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Exam:</label>
                <select
                  className="form-control"
                  value={anaExam}
                  onChange={e => setAnaExam(e.target.value)}
                  style={{ width: 160 }}
                >
                  {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Year:</label>
                <input
                  type="number"
                  className="form-control"
                  value={anaYear}
                  onChange={e => setAnaYear(e.target.value)}
                  style={{ width: 95 }}
                />
              </div>
            </div>

            {analysisResults.length === 0 ? (
              <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Results Found for this Examination</div>
                <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                  Enter marks in the "Enter Marks" tab first for Class {anaClass}-{anaSection} ({anaExam} {anaYear}).
                </div>
              </div>
            ) : (
              <div>
                {/* 4 Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div className="card" style={{ padding: '16px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Students</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                      {analysisStats.total}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '16px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Students Passed</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
                      {analysisStats.passed}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '16px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Students Failed</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', marginTop: 4 }}>
                      {analysisStats.failed}
                    </div>
                  </div>

                  <div className="card" style={{ padding: '16px 20px', background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Class Average</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold-400)', marginTop: 4 }}>
                      {analysisStats.avg}%
                    </div>
                  </div>
                </div>

                {/* Highlights row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18, marginBottom: 20 }}>
                  {/* Topper Card */}
                  <div className="card" style={{ padding: 20, background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <span>🥇</span> Class Topper (1st Rank)
                    </div>
                    {analysisStats.topper ? (
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {studentMap[analysisStats.topper.studentId]?.name || analysisStats.topper.studentId}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          Score: <strong>{analysisStats.topper.total}/{analysisStats.topper.maxTotal}</strong> &nbsp;•&nbsp;{' '}
                          Percentage: <strong style={{ color: 'var(--success)' }}>{analysisStats.topper.percentage}%</strong> &nbsp;•&nbsp;{' '}
                          Grade: <strong style={{ color: 'var(--gold-400)' }}>{analysisStats.topper.grade}</strong>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)' }}>No topper data</div>
                    )}
                  </div>

                  {/* Pass Percentage Card */}
                  <div className="card" style={{ padding: 20, background: 'var(--navy-800)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      Overall Pass Rate
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
                      {analysisStats.total > 0 ? Math.round((analysisStats.passed / analysisStats.total) * 100) : 0}%
                    </div>
                    <div style={{ width: '100%', background: 'var(--navy-900)', height: 8, borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
                      <div
                        style={{
                          width: `${analysisStats.total > 0 ? (analysisStats.passed / analysisStats.total) * 100 : 0}%`,
                          height: '100%',
                          background: 'var(--success)',
                          borderRadius: 4
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ranked Leaderboard Table */}
                <div className="card" style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', background: 'var(--navy-700)', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    🏆 Class Leaderboard — {anaExam} {anaYear} (Ranked by Percentage)
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--navy-800)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: '12px 16px', width: 80 }}>Rank</th>
                          <th style={{ padding: '12px 16px' }}>Student Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Total Marks</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Percentage</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Grade</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResults.map((r, idx) => {
                          const s = studentMap[r.studentId];
                          return (
                            <tr
                              key={r.key || idx}
                              style={{
                                borderBottom: '1px solid var(--border)',
                                background: idx === 0 ? 'rgba(234, 179, 8, 0.05)' : idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                              }}
                            >
                              <td style={{ padding: '12px 16px', fontWeight: 800, color: idx === 0 ? 'var(--gold-400)' : 'var(--text-secondary)' }}>
                                {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : ordinal(idx + 1)}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {s?.name || r.studentId}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--gold-400)' }}>
                                {r.total} / {r.maxTotal}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, color: r.percentage >= 33 ? 'var(--success)' : 'var(--danger)' }}>
                                {r.percentage}%
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span className={`badge ${r.percentage >= 75 ? 'badge-green' : r.percentage >= 33 ? 'badge-yellow' : 'badge-red'}`}>
                                  {r.grade}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span className={`badge ${r.pass ? 'badge-green' : 'badge-red'}`}>
                                  {r.pass ? 'PASS' : 'FAIL'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => openReportCard(s, r)}
                                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                                >
                                  📄 Report Card
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
      </div>

      {/* ══════════════════════════════════════════════════════
          REPORT CARD MODAL
          ══════════════════════════════════════════════════════ */}
      {showReportCardModal && reportCardStudent && reportCardResult && (
        <div
          className="modal-overlay active"
          onClick={() => setShowReportCardModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            opacity: 1,
            pointerEvents: 'all'
          }}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              color: '#0f172a',
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 12,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              transform: 'none'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: '#1e3a8a',
                color: '#fff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>📄 Student Progress Report Card</div>
              <button
                type="button"
                onClick={() => setShowReportCardModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Printable Report Card Area */}
            <div id="printableReportCardArea" style={{ padding: 26, fontSize: '13px' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: 14, marginBottom: 18 }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a', letterSpacing: 0.5 }}>
                  SHANTI GURUKUL, BACHANI
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: 2 }}>
                  Residential &amp; Day Boarding Senior Secondary School
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: 8, letterSpacing: 0.5 }}>
                  PROGRESS REPORT — {reportCardResult.exam} {reportCardResult.year}
                </div>
              </div>

              {/* Student Metadata Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 12, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, marginBottom: 18 }}>
                <div><span style={{ fontWeight: 700, color: '#475569' }}>Student Name:</span> <strong>{reportCardStudent.name}</strong></div>
                <div><span style={{ fontWeight: 700, color: '#475569' }}>Roll No:</span> <strong>{reportCardStudent.id}</strong></div>
                <div><span style={{ fontWeight: 700, color: '#475569' }}>Class:</span> Class {reportCardStudent.class}-{reportCardStudent.section}</div>
                <div><span style={{ fontWeight: 700, color: '#475569' }}>Category:</span> {reportCardStudent.type === 'residential' ? 'Residential Boarder' : 'Day Scholar'}</div>
              </div>

              {/* Subjects Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
                <thead>
                  <tr style={{ background: '#1e3a8a', color: '#fff', fontSize: '12px' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Subject</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', width: 90 }}>Max Marks</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', width: 110 }}>Marks Obtained</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', width: 90 }}>Grade</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center', width: 130 }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportCardResult.subjects || {}).length === 0 ? (
                    <tr style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>Cumulative Assessment / Total Marks</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{reportCardResult.maxTotal || 600}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{reportCardResult.total}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#1e40af' }}>{reportCardResult.grade}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>{reportCardResult.remark || (reportCardResult.percentage >= 33 ? 'Passed' : 'Needs Improvement')}</td>
                    </tr>
                  ) : (
                    Object.entries(reportCardResult.subjects || {}).map(([sub, score], idx) => {
                      const gi = calculateGrade(Number(score || 0));
                      return (
                        <tr key={sub} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '7px 12px', fontWeight: 600 }}>{sub}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', color: '#64748b' }}>100</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: 700 }}>{score}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', fontWeight: 700, color: '#1e40af' }}>{gi.grade}</td>
                          <td style={{ padding: '7px 12px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>{gi.remark}</td>
                        </tr>
                      );
                    })
                  )}
                  <tr style={{ background: '#fef3c7', fontWeight: 800, borderTop: '2px solid #b45309' }}>
                    <td style={{ padding: '8px 12px' }}>TOTAL SCORE</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{reportCardResult.maxTotal}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: '#b45309' }}>{reportCardResult.total}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{reportCardResult.grade}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{reportCardResult.percentage}%</td>
                  </tr>
                </tbody>
              </table>

              {/* 4 Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, textAlign: 'center', marginBottom: 18 }}>
                <div style={{ padding: '10px 8px', background: '#f1f5f9', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Percentage</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: reportCardResult.percentage >= 33 ? '#16a34a' : '#dc2626', marginTop: 2 }}>
                    {reportCardResult.percentage}%
                  </div>
                </div>

                <div style={{ padding: '10px 8px', background: '#f1f5f9', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Overall Grade</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e40af', marginTop: 2 }}>
                    {reportCardResult.grade}
                  </div>
                </div>

                <div style={{ padding: '10px 8px', background: '#f1f5f9', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Class Rank</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#d97706', marginTop: 2 }}>
                    {reportCardRank ? ordinal(reportCardRank) : '—'}
                  </div>
                </div>

                <div style={{ padding: '10px 8px', background: '#f1f5f9', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Exam Outcome</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: reportCardResult.pass ? '#16a34a' : '#dc2626', marginTop: 2 }}>
                    {reportCardResult.pass ? 'PASSED' : 'FAILED'}
                  </div>
                </div>
              </div>

              {/* Remarks Box */}
              <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 6, marginBottom: 24, fontSize: '12px' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>Overall Assessment:</span> {reportCardResult.remark || 'Satisfactory academic performance.'}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontWeight: 700 }}>Promotional Status:</span>{' '}
                  <strong style={{ color: reportCardResult.pass ? '#16a34a' : '#dc2626' }}>
                    {reportCardResult.pass ? `Eligible for promotion to Class ${Number(reportCardStudent.class) + 1}th` : 'Requires improvement in key subjects'}
                  </strong>
                </div>
              </div>

              {/* Signature Lines */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 30, marginTop: 30, fontSize: '11px', color: '#475569' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 6 }}>Class Teacher</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 6 }}>Principal</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: 6 }}>Parent / Guardian</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '12px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowReportCardModal(false)}
                style={{ color: '#0f172a', borderColor: '#cbd5e1' }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const content = document.getElementById('printableReportCardArea')?.innerHTML;
                  const printWin = window.open('', '_blank', 'width=750,height=800');
                  if (printWin) {
                    printWin.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Report Card — Shanti Gurukul</title>
                        <style>
                          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; }
                        </style>
                      </head>
                      <body>
                        ${content}
                        <script>window.onload = function() { window.print(); }<\/script>
                      </body>
                      </html>
                    `);
                    printWin.document.close();
                  }
                }}
              >
                🖨️ Print Report Card
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
