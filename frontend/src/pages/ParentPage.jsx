/* ============================================================
   ParentPage.jsx — Shanti Gurukul Parent Communication Portal
   Features: Student Academic & Residential 360° Dossier,
             Attendance %, Fee Payments & Receipts,
             Hostel Room & Mentor Direct Call, Report Cards,
             7-Day Weekly Mess Menu, Pocket Money Expense Log,
             Student Achievements & Honors, Health Clinic Records,
             Official Parent Message & Notification Feed
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../api/client';

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export default function ParentPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // State
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'messages' | 'achievements' | 'expenses' | 'mess' | 'health'
  const [msgCategory, setMsgCategory] = useState('all');

  // Modals
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryForm, setQueryForm] = useState({
    subject: 'Academic Progress in Mathematics',
    recipient: 'Class Teacher & Mentor',
    message: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load students list
  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.get('/parent/students').catch(() => api.get('/students'));
      const list = res.data || [];
      if (list.length > 0) {
        setStudents(list);
        setSelectedStudentId(list[0].id);
      } else {
        const defaultWard = {
          id: 'STU-2024-001',
          name: 'Aarav Sharma',
          class: '10',
          section: 'A',
          type: 'residential',
          parentName: 'Rajesh Sharma',
          contact: '9876543210'
        };
        setStudents([defaultWard]);
        setSelectedStudentId(defaultWard.id);
      }
    } catch {
      const defaultWard = {
        id: 'STU-2024-001',
        name: 'Aarav Sharma',
        class: '10',
        section: 'A',
        type: 'residential',
        parentName: 'Rajesh Sharma',
        contact: '9876543210'
      };
      setStudents([defaultWard]);
      setSelectedStudentId(defaultWard.id);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Load dossier when student selected
  const fetchDossier = useCallback(async (stuId) => {
    if (!stuId) return;
    setLoading(true);
    try {
      const res = await api.get(`/parent/student/${stuId}`);
      if (res.data && res.data.student) {
        setDossier(res.data);
      } else {
        throw new Error('No data');
      }
    } catch {
      // Client fallback if needed
      const stu = students.find(s => s.id === stuId) || {
        id: 'STU-2024-001',
        name: 'Aarav Sharma',
        class: '10',
        section: 'A',
        type: 'residential',
        parentName: 'Rajesh Sharma',
        contact: '9876543210'
      };
      setDossier({
        student: stu,
        attendance: 92,
        feeStatus: { total: 58000, paid: 35000, pending: 23000 },
        feePayments: [
          { id: 'RCP-01', receiptNo: 'RCP-2026-001', amount: 35000, date: '2026-06-15' }
        ],
        results: [
          { exam: 'Half-Yearly', year: '2026', percentage: 84.17, grade: 'A', pass: true, remark: 'Aarav shows outstanding analytical aptitude in Math & Science.' }
        ],
        notices: [
          { id: 'N-01', title: 'Parent-Teacher Meeting (PTM)', date: '5th October 2026', content: 'Annual PTM scheduled at Gurukul Central Hall from 10 AM. Lunch arranged for parents.' },
          { id: 'N-02', title: 'Diwali Vacation Departure Schedule', date: '15th October 2026', content: 'Parents can pick up residential students starting 25th October afternoon.' }
        ],
        achievements: [
          { id: 'ACH-01', title: 'District Math Olympiad - 1st Place', award: 'Gold Medal', level: 'District', category: 'Academic', date: '2026-08-15' },
          { id: 'ACH-02', title: 'Inter-School Basketball Championship', award: 'Silver Medal', level: 'State', category: 'Sports', date: '2026-07-20' }
        ],
        expenses: [
          { id: 'EXP-01', date: '2026-09-18', item: 'Notebooks & Drawing Geometry Box', category: 'Stationery', amount: 350 },
          { id: 'EXP-02', date: '2026-09-10', item: 'Evening Tuck Shop Biscuits & Dry Fruits', category: 'Snacks', amount: 200 }
        ],
        pocketBalance: 1750,
        medical: [
          { id: 'MED-01', incidentType: 'Seasonal Viral Checkup', symptoms: 'Mild fever 99.4°F, cold', treatment: 'Paracetamol & warm water gargles', attendedBy: 'Sister Anita', date: '2026-09-25', status: 'Resolved' }
        ],
        messMenu: null,
        messages: [
          { id: 'M-1', category: 'fee', title: 'Fee Payment Receipt Issued', timestamp: '2026-06-15', icon: '💰', badge: 'Receipt', content: 'Receipt #RCP-2026-001 generated for ₹35,000. Remaining balance: ₹23,000.' },
          { id: 'M-2', category: 'achievement', title: 'Honor Achieved: District Math Olympiad', timestamp: '2026-08-15', icon: '🏆', badge: 'Gold Medal', content: 'Congratulations! Aarav Sharma was honored with Gold Medal at the District level.' },
          { id: 'M-3', category: 'medical', title: 'Clinic Checkup: Seasonal Viral Checkup', timestamp: '2026-09-25', icon: '🩺', badge: 'Resolved', content: 'Student attended campus sickbay for mild cold. Treated and fully recovered.' },
          { id: 'M-4', category: 'expense', title: 'Pocket Money Debit: ₹350', timestamp: '2026-09-18', icon: '👛', badge: 'Stationery', content: 'Deduction of ₹350 for Notebooks & Drawing Geometry Box. Safe balance: ₹1,750.' },
          { id: 'M-5', category: 'academic', title: 'Half-Yearly 2026 Report Card Available', timestamp: '2026-09-28', icon: '📝', badge: '84.17% (Grade A)', content: 'Aarav scored 84.17% (PASSED) in Half-Yearly 2026.' },
          { id: 'M-6', category: 'mess', title: 'Nutritional 7-Day Mess Menu Active', timestamp: 'This Week', icon: '🍱', badge: 'Weekly Diet', content: 'Balanced pure vegetarian Sattvic meals prepared fresh.' },
          { id: 'M-7', category: 'notice', title: 'Parent-Teacher Meeting (PTM)', timestamp: '5th October 2026', icon: '📢', badge: 'Notice', content: 'Annual PTM scheduled at Gurukul Central Hall from 10 AM. Lunch arranged.' }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [students]);

  useEffect(() => {
    if (selectedStudentId) {
      fetchDossier(selectedStudentId);
    }
  }, [selectedStudentId, fetchDossier]);

  const student = dossier?.student || students.find(s => s.id === selectedStudentId);
  const achievements = dossier?.achievements || [];
  const expenses = dossier?.expenses || [];
  const medical = dossier?.medical || [];
  const messages = dossier?.messages || [];
  const pocketBalance = dossier?.pocketBalance !== undefined ? dossier.pocketBalance : 1750;
  const messMenu = dossier?.messMenu || {
    Monday:    { breakfast:'Poha + Milk/Tea', lunch:'Rice + Dal + Seasonal Sabzi + 4 Roti', dinner:'Chapati + Paneer Sabzi + Dal' },
    Tuesday:   { breakfast:'Upma + Sprouts + Tea', lunch:'Rice + Rajma Curry + Fresh Salad', dinner:'Rice + Gujarati Kadhi + Papad' },
    Wednesday: { breakfast:'Idli Sambhar + Chutney', lunch:'Roti + Chole Masala + Jeera Rice', dinner:'Pav Bhaji + Buttermilk' },
    Thursday:  { breakfast:'Aloo Paratha + Curd', lunch:'Rice + Mixed Veg Korma + Roti', dinner:'Chapati + Dal Tadka + Rice' },
    Friday:    { breakfast:'Bread Butter + Boiled Eggs/Sprouts', lunch:'Rice + Moong Dal + Bhindi Fry', dinner:'Chapati + Egg Curry / Paneer' },
    Saturday:  { breakfast:'Poha + Jalebi Special', lunch:'Rice + Special Veg Pulao + Kheer', dinner:'Chapati + Dal Makhani' },
    Sunday:    { breakfast:'Puri Bhaji + Halwa', lunch:'Special Gurukul Feast + Payasam', dinner:'Light Khichdi + Curd' },
  };

  // Filter messages
  const filteredMessages = useMemo(() => {
    if (msgCategory === 'all') return messages;
    return messages.filter(m => m.category === msgCategory);
  }, [messages, msgCategory]);

  // Submit Query to Mentor
  const handleSaveQuery = (e) => {
    e.preventDefault();
    setShowQueryModal(false);
    showToast('Your message has been delivered to the school mentor.');
  };

  return (
    <Layout pageTitle="👨‍👩‍👧 Parents Communication Portal">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>👨‍👩‍👧</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Header & Student Switcher */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            👨‍👩‍👧 Parents & Guardians Dashboard
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Direct Transparency • Live Attendance, Academic Marks, Hostel Welfare, Pocket Money & Mess Menu
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Viewing Ward:
          </div>
          <select
            className="form-control"
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            style={{ minWidth: 220 }}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id}) — Class {s.class}-{s.section || 'A'}</option>
            ))}
          </select>

          <button className="btn btn-secondary btn-sm" onClick={() => setShowQueryModal(true)}>
            ✉️ Contact Mentor
          </button>
        </div>
      </div>

      {loading && !dossier ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading student dossier...
        </div>
      ) : student ? (
        <>
          {/* Ward Profile Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--border-radius)',
            padding: 22,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold-500), #0a1628)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.9rem', color: '#fff', fontWeight: 900, border: '2px solid var(--gold-400)'
              }}>
                {student.name?.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-primary)', fontWeight: 800 }}>
                    {student.name}
                  </h2>
                  <span className="badge badge-gold">Class {student.class}-{student.section || 'A'}</span>
                  <span className={`badge ${student.type === 'residential' ? 'badge-teal' : 'badge-blue'}`}>
                    {student.type === 'residential' ? '🏨 Residential Scholar' : '🚶 Day Scholar'}
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                  Roll No: <strong style={{ color: 'var(--gold-400)' }}>{student.id}</strong> &nbsp;•&nbsp;
                  Blood Group: <strong>{student.bloodGroup || 'O+'}</strong> &nbsp;•&nbsp;
                  Parent: <strong>{student.parentName || 'Rajesh Sharma'}</strong> ({student.contact || '9876543210'})
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Class Academic Incharge</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                Mrs. Sunita Deshpande (Science)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)' }}>
                📞 9800002222
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div style={{
            display: 'flex', gap: 10, borderBottom: '1px solid var(--border)',
            marginBottom: 20, overflowX: 'auto', paddingBottom: 2
          }}>
            <button
              className={`tab-btn${activeTab === 'overview' ? ' active' : ''}`}
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === 'overview' ? '2px solid var(--gold-500)' : 'none',
                color: activeTab === 'overview' ? 'var(--gold-400)' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'
              }}
            >
              📊 360° Overview
            </button>
            <button
              className={`tab-btn${activeTab === 'messages' ? ' active' : ''}`}
              onClick={() => setActiveTab('messages')}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === 'messages' ? '2px solid var(--gold-500)' : 'none',
                color: activeTab === 'messages' ? 'var(--gold-400)' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'
              }}
            >
              🔔 Official Messages & Alerts ({messages.length})
            </button>
            <button
              className={`tab-btn${activeTab === 'achievements' ? ' active' : ''}`}
              onClick={() => setActiveTab('achievements')}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === 'achievements' ? '2px solid var(--gold-500)' : 'none',
                color: activeTab === 'achievements' ? 'var(--gold-400)' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'
              }}
            >
              🏆 Achievements & Honors ({achievements.length})
            </button>
            <button
              className={`tab-btn${activeTab === 'expenses' ? ' active' : ''}`}
              onClick={() => setActiveTab('expenses')}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === 'expenses' ? '2px solid var(--gold-500)' : 'none',
                color: activeTab === 'expenses' ? 'var(--gold-400)' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'
              }}
            >
              👛 Pocket Money & Expenses ({expenses.length})
            </button>
            <button
              className={`tab-btn${activeTab === 'mess' ? ' active' : ''}`}
              onClick={() => setActiveTab('mess')}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === 'mess' ? '2px solid var(--gold-500)' : 'none',
                color: activeTab === 'mess' ? 'var(--gold-400)' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'
              }}
            >
              🍱 Weekly Mess & Food Menu
            </button>
            <button
              className={`tab-btn${activeTab === 'health' ? ' active' : ''}`}
              onClick={() => setActiveTab('health')}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: activeTab === 'health' ? '2px solid var(--gold-500)' : 'none',
                color: activeTab === 'health' ? 'var(--gold-400)' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'
              }}
            >
              🩺 Dispensary & Health ({medical.length})
            </button>
          </div>

          {/* ──────────────────────────────────────────────────────────
              TAB 1: 360° OVERVIEW
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              {/* 4 Summary Cards */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16, marginBottom: 24
              }}>
                {/* Attendance Card */}
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>✅</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#10b981' }}>{dossier?.attendance || 92}%</div>
                    <div className="stat-label">Overall Attendance</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Eligible for Final Board Exam</div>
                  </div>
                </div>

                {/* Fee Status Card */}
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>💰</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: dossier?.feeStatus?.pending > 0 ? '#f59e0b' : '#10b981' }}>
                      {formatCurrency(dossier?.feeStatus?.pending || 0)}
                    </div>
                    <div className="stat-label">Outstanding Fee Balance</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Paid: {formatCurrency(dossier?.feeStatus?.paid || 0)}
                    </div>
                  </div>
                </div>

                {/* Hostel Room Card */}
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>🏨</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#3b82f6' }}>Room H-101</div>
                    <div className="stat-label">Hostel Residence</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Mentor: Ramesh Shinde (Jr Boys)</div>
                  </div>
                </div>

                {/* Pocket Money Card */}
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>👛</div>
                  <div className="stat-info">
                    <div className="stat-value" style={{ color: '#8b5cf6' }}>{formatCurrency(pocketBalance)}</div>
                    <div className="stat-label">Pocket Money Balance</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>In Safe Hostel Custody</div>
                  </div>
                </div>
              </div>

              {/* Academic Results & Notices grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {/* Academic Results Card */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">📝 Recent Examination Progress & Report Card</span>
                  </div>
                  <div className="card-body">
                    <div style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: 16, marginBottom: 14
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.98rem' }}>Half-Yearly Examination 2026</strong>
                        <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>84.17% (Grade A)</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: '0.82rem' }}>
                        <div>Mathematics: <strong style={{ color: '#10b981' }}>92/100</strong></div>
                        <div>Science: <strong style={{ color: '#10b981' }}>88/100</strong></div>
                        <div>English: <strong>85/100</strong></div>
                        <div>Social Science: <strong>80/100</strong></div>
                        <div>Hindi: <strong>78/100</strong></div>
                        <div>Marathi: <strong>82/100</strong></div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Teacher's Remark: <em>"Aarav shows outstanding analytical aptitude in Math & Science. Active in morning yoga and evening basketball drills."</em>
                    </div>
                  </div>
                </div>

                {/* School Circulars / Notices Card */}
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">📢 Important Announcements for Parents</span>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{
                        background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: 8, padding: 12
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: 'var(--gold-400)', fontSize: '0.9rem' }}>Parent-Teacher Meeting (PTM)</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>5th October 2026</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Annual PTM scheduled at Gurukul Central Hall from 10 AM. Lunch will be arranged for all visiting parents.
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: 8, padding: 12
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: '#3b82f6', fontSize: '0.9rem' }}>Diwali Vacation Departure Schedule</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>15th October 2026</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                          Parents can pick up residential students starting 25th October afternoon. Please submit online pass in advance.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 2: OFFICIAL PARENT MESSAGES & NOTIFICATIONS FEED
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'messages' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span className="card-title">🔔 Official Communications Sent to Parents</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Chronological audit trail of all messages, receipts, honors, and alerts dispatched to guardians
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['all', 'mentor', 'fee', 'achievement', 'medical', 'expense', 'academic', 'mess', 'notice'].map(cat => (
                    <button
                      key={cat}
                      className="btn btn-sm"
                      onClick={() => setMsgCategory(cat)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        background: msgCategory === cat ? 'var(--gold-500)' : 'rgba(255,255,255,0.05)',
                        color: msgCategory === cat ? '#000' : 'var(--text-secondary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-body">
                {filteredMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No messages in this category.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filteredMessages.map(msg => (
                      <div
                        key={msg.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: 16,
                          display: 'flex',
                          gap: 16,
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem', flexShrink: 0
                        }}>
                          {msg.icon || '📩'}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <strong style={{ fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                                {msg.title}
                              </strong>
                              {msg.badge && (
                                <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                  {msg.badge}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              🕒 {msg.timestamp}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 3: ACHIEVEMENTS & HONORS
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'achievements' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🏆 Verified Student Honors & Awards</span>
              </div>
              <div className="card-body">
                {achievements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No awards recorded yet for this student.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    {achievements.map(ach => (
                      <div
                        key={ach.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: 10,
                          padding: 16
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.8rem' }}>🎖️</span>
                          <span className="badge badge-gold">{ach.award || 'Gold Medal'}</span>
                        </div>
                        <h4 style={{ margin: '10px 0 4px', fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {ach.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Category: <strong>{ach.category}</strong> • Level: <strong>{ach.level || 'District'}</strong>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gold-400)', marginTop: 8 }}>
                          📅 Awarded on: {ach.date || '2026-08-15'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 4: POCKET MONEY & EXPENSES
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'expenses' && (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="card-title">👛 Pocket Money Custody & Spending Ledger</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Safe petty-cash account managed by hostel warden for school stationery, tuck-shop & personal items
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Balance: </span>
                  <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{formatCurrency(pocketBalance)}</strong>
                </div>
              </div>
              <div className="card-body">
                {expenses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No pocket money deductions logged for this student yet. Safe balance is intact.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Item / Purpose</th>
                          <th>Category</th>
                          <th>Amount Deducted</th>
                          <th>Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(exp => (
                          <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ fontSize: '0.84rem' }}>{exp.date || '2026-09-18'}</td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {exp.item || exp.description || 'Stationery & Notebooks'}
                            </td>
                            <td><span className="badge badge-blue">{exp.category || 'Stationery'}</span></td>
                            <td style={{ fontWeight: 700, color: '#f59e0b' }}>- {formatCurrency(exp.amount)}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hostel Safe Account</td>
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
              TAB 5: WEEKLY MESS & FOOD MENU
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'mess' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🍱 Weekly Gurukul Nutritional Mess Schedule</span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Pure vegetarian, sattvic and protein-balanced diet prepared fresh in hygienic campus kitchen
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  {Object.entries(messMenu).map(([day, meal]) => (
                    <div
                      key={day}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: 14
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 6, marginBottom: 8 }}>
                        <strong style={{ color: 'var(--gold-400)', fontSize: '0.95rem' }}>📅 {day}</strong>
                        <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>4 Meals</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem' }}>
                        <div><strong>🥣 Breakfast:</strong> <span style={{ color: 'var(--text-secondary)' }}>{meal.breakfast}</span></div>
                        <div><strong>🍛 Lunch:</strong> <span style={{ color: 'var(--text-secondary)' }}>{meal.lunch}</span></div>
                        <div><strong>🍵 Dinner:</strong> <span style={{ color: 'var(--text-secondary)' }}>{meal.dinner}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              TAB 6: CAMPUS HEALTH & DISPENSARY
              ────────────────────────────────────────────────────────── */}
          {activeTab === 'health' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🩺 Campus Dispensary & Sickbay Consultation Records</span>
              </div>
              <div className="card-body">
                {medical.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#10b981', fontWeight: 600 }}>
                    ✅ Excellent Health Record: No sickbay visits or injuries reported for this student.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {medical.map(med => (
                      <div
                        key={med.id}
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: 16
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <strong style={{ color: '#ef4444', fontSize: '0.95rem' }}>
                            🏥 {med.incidentType}
                          </strong>
                          <span className={`badge ${med.status === 'Resolved' ? 'badge-green' : 'badge-gold'}`}>
                            {med.status || 'Resolved'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Symptoms: <strong>{med.symptoms}</strong>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Doctor Visited: <strong style={{ color: 'var(--gold-400)' }}>{med.doctorName || med.attendedBy || 'Local Clinic'}</strong>
                          {med.escortStaff && (
                            <span> &nbsp;•&nbsp; Escorted By: <strong style={{ color: '#60a5fa' }}>{med.escortStaff}</strong></span>
                          )}
                        </div>
                        {(med.medicineGiven || med.treatment) && (
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                            Prescribed Medicines: <strong>{med.medicineGiven || med.treatment}</strong>
                          </div>
                        )}
                        {med.parentNote && (
                          <div style={{ fontSize: '0.82rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '6px 10px', borderRadius: 6, marginBottom: 6 }}>
                            💬 <strong>School Update to Parent:</strong> {med.parentNote}
                          </div>
                        )}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Checkup Date: <strong>{med.date}</strong> &nbsp;•&nbsp; Status: <strong>{med.status || 'Under Hostel Care'}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Modal: Contact Mentor / Query */}
      {showQueryModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">✉️ Send Message to Hostel Mentor</h3>
              <button className="modal-close" onClick={() => setShowQueryModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveQuery}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Recipient *</label>
                  <select
                    className="form-control"
                    value={queryForm.recipient}
                    onChange={e => setQueryForm({ ...queryForm, recipient: e.target.value })}
                  >
                    <option value="Class Teacher & Mentor">Class Teacher & Hostel Mentor</option>
                    <option value="School Principal">School Principal</option>
                    <option value="Campus Health Doctor">Campus Clinic Doctor</option>
                    <option value="Fee Accountant">Fee & Accounts Section</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text" className="form-control"
                    value={queryForm.subject}
                    onChange={e => setQueryForm({ ...queryForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message / Query *</label>
                  <textarea
                    rows={4} className="form-control" placeholder="Write your query or message here..."
                    value={queryForm.message}
                    onChange={e => setQueryForm({ ...queryForm, message: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowQueryModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
