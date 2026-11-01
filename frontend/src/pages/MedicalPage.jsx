/* ============================================================
   MedicalPage.jsx — Residential Student Medical & Doctor Escort Care
   Shanti Gurukul Residential School, Bachani
   Strictly for 150 Residential Students (Hostel Boarders)
   Features:
   - Outside Doctor & Clinic Visit Logging
   - Escort Staff / Mentor tracking (Teacher / Warden who took student)
   - Symptoms, Doctor's Diagnosis & Prescribed Medicines
   - Hostel Medicine Administration & Recovery Status
   - Direct Sync with Parent Portal
   - Local Clinics & Hospital Directory (Bachani & Kagal)
   - Printable Official Doctor Escort & Prescription Pass
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const STATUS_CONFIG = {
  'Resting in Hostel': { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', label: '🛌 Resting in Hostel' },
  'Under Observation': { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)', label: '🩺 Under Observation' },
  'Resolved':          { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)', label: '✅ Recovered & Back' },
  'Hospital Shifted':  { bg: 'rgba(239, 68, 68, 0.15)',  color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)',  label: '🚨 Hospital Admitted' },
};

const LOCAL_MEDICAL_DIRECTORY = [
  {
    role: 'Primary Family & Child Clinic',
    name: 'Dr. M. K. Kulkarni Clinic (MBBS, DCH)',
    phone: '+91 98220 54321',
    location: 'Bachani Village Market (0.8 km from School Gate)',
    timing: '8:30 AM – 1:30 PM & 4:30 PM – 8:30 PM',
    notes: 'Regular visiting clinic for Gurukul hostel students. Handles fever, infections, cough, minor injuries.'
  },
  {
    role: '24/7 Government Hospital & Emergency',
    name: 'Kagal Sub-District Civil Hospital',
    phone: '02325-244102 / 108',
    location: 'Station Road, Kagal (4.5 km from Campus)',
    timing: 'Open 24 Hours • Emergency Casualty & Trauma',
    notes: 'Full government hospital with X-Ray, blood testing laboratory, ultrasound, and observation beds.'
  },
  {
    role: 'Pediatric & Orthopedic Care',
    name: 'Dr. Patil Child & Family Care Clinic',
    phone: '+91 98901 12345',
    location: 'Main Road, Kagal Town (5 km)',
    timing: '9:00 AM – 2:00 PM & 5:00 PM – 9:00 PM',
    notes: 'Specialist pediatrician for sports injuries, sprains, fractures, and severe viral infections.'
  },
  {
    role: 'Local Pharmacy & Medical Supplies',
    name: 'Bachani Community Medical Store',
    phone: '+91 98220 54323',
    location: 'Opposite ST Bus Stand, Bachani (0.7 km)',
    timing: '8:00 AM – 10:00 PM (Emergency on-call)',
    notes: 'All doctor prescription medicines, ORS sachets, bandages, pain relief sprays, and steam vaporizers.'
  },
  {
    role: 'Gurukul 24/7 Campus Transport',
    name: 'School Emergency Ambulance / Vehicle',
    phone: '+91 98220 00108 / Main Gate Desk',
    location: 'Main Administrative Gate Parking Bay',
    timing: 'Ready 24/7 on campus with first-aid kit',
    notes: 'Dedicated driver on duty for immediate transit of sick residential students to Bachani or Kagal clinics.'
  }
];

const DEFAULT_STAFF_ESCORTS = [
  'Mr. Sanjay Bhosale (Residential Mentor — Junior Boys Wing A)',
  'Mr. Ramesh Shinde (Residential Mentor — Junior Boys Wing B)',
  'Mr. Suresh Jadhav (Residential Mentor — Middle Boys Wing)',
  'Mr. Deepak Kadam (Residential Mentor — Senior Boys Wing)',
  'Mr. Ramesh Gupta (Class Teacher 10-A)',
  'Mrs. Sunita Deshpande (Class Teacher 9-A)',
  'Mrs. Lata Mehta (Class Teacher 8-A)',
  'Mr. Deepak Patil (Class Teacher 7-A)',
  'Mr. Prakash Kulkarni (Class Teacher 6-A)',
  'Mrs. Vandana Sharma (Class Teacher 5-A)',
  'Mr. Vikram Shinde (Physical Education Teacher)',
];

const DEFAULT_DOCTORS = [
  'Dr. M. K. Kulkarni Clinic (Bachani Market)',
  'Kagal Sub-District Civil Hospital',
  'Dr. Patil Child & Family Clinic (Kagal)',
  'Lifeline Emergency Trauma Centre (Kolhapur Highway)',
  'Other Local Visiting Clinic'
];

export default function MedicalPage() {
  const { user } = useAuth();
  const canEdit = ['admin', 'warden', 'principal', 'teacher', 'mentor'].includes(user?.role);

  // States
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'emergency'
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State for Doctor Escort
  const [form, setForm] = useState({
    studentId: '',
    date: new Date().toISOString().slice(0, 10),
    incidentType: 'Viral Fever & Body Ache',
    severity: 'Normal',
    symptoms: '',
    doctorName: DEFAULT_DOCTORS[0],
    escortStaff: DEFAULT_STAFF_ESCORTS[0],
    treatment: '',
    medicineGiven: '',
    medicineIncharge: 'Hostel Warden',
    medicalCost: 200,
    costPaidBy: 'School Emergency Health Fund',
    status: 'Resting in Hostel',
    guardianNotified: true,
    parentNote: '',
    hospitalShifted: false,
    allergies: 'None'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [medRes, stuRes] = await Promise.all([
        api.get('/medical'),
        api.get('/students').catch(() => ({ data: [] }))
      ]);
      setIncidents(medRes.data || []);
      setStudents(stuRes.data || []);
    } catch {
      showToast('Could not load medical logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Strictly Residential Students (hostel boarders)
  const residentialStudents = useMemo(() => {
    return students.filter(s => s.type === 'residential');
  }, [students]);

  // Currently selected student object in modal form
  const currentSelectedStudent = useMemo(() => {
    if (!form.studentId) return null;
    return students.find(s => s.id === form.studentId);
  }, [form.studentId, students]);

  // Statistics
  const stats = useMemo(() => {
    const total = incidents.length;
    const restingInHostel = incidents.filter(i => i.status === 'Resting in Hostel' || i.status === 'Under Observation').length;
    const hospitalShifted = incidents.filter(i => i.status === 'Hospital Shifted' || i.hospitalShifted).length;
    const resolved = incidents.filter(i => i.status === 'Resolved').length;
    return { total, restingInHostel, hospitalShifted, resolved };
  }, [incidents]);

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(item => {
      const q = query.toLowerCase();
      const matchQ = !q ||
        item.studentName?.toLowerCase().includes(q) ||
        item.studentId?.toLowerCase().includes(q) ||
        item.incidentType?.toLowerCase().includes(q) ||
        item.doctorName?.toLowerCase().includes(q) ||
        item.escortStaff?.toLowerCase().includes(q) ||
        item.symptoms?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchQ && matchStatus;
    });
  }, [incidents, query, statusFilter]);

  // Open modal to add a new doctor escort visit
  const openNewIncident = () => {
    const firstRes = residentialStudents[0] || students[0];
    setForm({
      studentId: firstRes?.id || '',
      date: new Date().toISOString().slice(0, 10),
      incidentType: 'Viral Fever & Cough',
      severity: 'Normal',
      symptoms: 'Fever 100.8°F, chills, throat soreness since morning',
      doctorName: DEFAULT_DOCTORS[0],
      escortStaff: DEFAULT_STAFF_ESCORTS[0],
      treatment: 'Doctor examined student. Prescribed Paracetamol 500mg, cough syrup, warm water and 2 days room rest.',
      medicineGiven: 'Paracetamol 500mg twice daily after meals, Cough syrup 5ml bedtime',
      medicineIncharge: 'Warden Sanjay Bhosale',
      medicalCost: 200,
      costPaidBy: 'School Emergency Health Fund',
      status: 'Resting in Hostel',
      guardianNotified: true,
      parentNote: `Informed parent via call. Prescribed medicines started; student resting comfortably in hostel room.`,
      hospitalShifted: false,
      allergies: 'None'
    });
    setShowIncidentModal(true);
  };

  // Submit doctor escort incident
  const handleSaveIncident = async (e) => {
    e.preventDefault();
    setSaving(true);
    const stu = students.find(s => s.id === form.studentId);
    const payload = {
      ...form,
      studentName: stu?.name || 'Student',
      class: stu?.class || '10',
      section: stu?.section || 'A',
      bloodGroup: stu?.bloodGroup || 'B+',
      parentContact: stu?.contact ? `${stu.contact} (${stu.address || 'Guardian'})` : 'Guardian Contact',
      attendedBy: form.doctorName
    };

    try {
      const res = await api.post('/medical', payload);
      setIncidents([res.data, ...incidents]);
      setShowIncidentModal(false);
      showToast('Doctor escort record logged & synced to Parent Portal!');
    } catch {
      showToast('Failed to record doctor escort visit.');
    } finally {
      setSaving(false);
    }
  };

  // Delete incident
  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor escort record?')) return;
    try {
      await api.delete(`/medical/${id}`);
      setIncidents(incidents.filter(i => i.id !== id));
      showToast('Medical record removed.');
    } catch {
      showToast('Failed to delete medical record.');
    }
  };

  // View & print slip
  const handleViewSlip = (item) => {
    setSelectedIncident(item);
    setShowSlipModal(true);
  };

  // Isolated Print Helper for Medical Pass (no background leak)
  const handlePrintSlip = (item) => {
    if (!item) return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Medical &amp; Doctor Escort Pass — ${item.studentName}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 20mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; background: #ffffff; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif; }
    .slip-box { max-width: 600px; margin: 0 auto; border: 1.5px solid #0f172a; border-radius: 8px; padding: 24px 28px; }
    .school-header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; }
    .org-banner { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #d97706; text-transform: uppercase; margin-bottom: 2px; }
    .school-title { font-size: 22px; font-weight: 900; color: #1e3a8a; letter-spacing: 1px; margin: 0; }
    .school-sub { font-size: 11.5px; color: #475569; margin-top: 3px; }
    .school-motto { font-size: 11px; font-style: italic; color: #d97706; margin-top: 3px; }
    .slip-title { font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 6px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px 14px; margin-bottom: 14px; font-size: 12.5px; }
    .meta-grid strong { color: #0f172a; }
    .section-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; margin-bottom: 14px; font-size: 12.5px; background: #ffffff; }
    .section-title { font-size: 12px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .presc-box { background: #eff6ff; border: 1.5px solid #1e3a8a; border-radius: 6px; padding: 12px 14px; margin-bottom: 18px; font-size: 12.5px; }
    .presc-title { font-weight: 900; color: #1e3a8a; margin-bottom: 6px; }
    .sig-row { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 24px; }
    .sig-col { text-align: center; font-size: 11px; }
    .sig-line { width: 140px; border-bottom: 1.5px solid #0f172a; margin: 0 auto 5px; }
  </style>
</head>
<body>
  <div class="slip-box">
    <div class="school-header">
      <div class="org-banner">RangBharti's</div>
      <h1 class="school-title">SHANTI GURUKUL</h1>
      <div class="school-sub">Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234</div>
      <div class="school-motto">ज्ञानं परमं बलम् • Residential School Care</div>
      <div class="slip-title">Official Doctor Escort &amp; Prescription Slip</div>
    </div>

    <div class="meta-grid">
      <div><strong>Record Ref:</strong> ${item.id}</div>
      <div><strong>Visit Date:</strong> ${item.date}</div>
      <div><strong>Student Name:</strong> ${item.studentName}</div>
      <div><strong>Roll No:</strong> ${item.studentId}</div>
      <div><strong>Class:</strong> ${item.class}-${item.section || 'A'} (🏠 Residential)</div>
      <div><strong>Blood Group:</strong> ${item.bloodGroup || 'O+'}</div>
    </div>

    <div class="section-card">
      <div class="section-title">🏥 Doctor &amp; Escort Staff Details</div>
      <div style="margin-bottom: 4px;"><strong>Doctor / Clinic:</strong> ${item.doctorName || item.attendedBy}</div>
      <div><strong>Escort Staff / Mentor:</strong> ${item.escortStaff || 'Hostel Staff'}</div>
    </div>

    <div class="section-card">
      <div class="section-title">🩺 Symptoms &amp; Clinical Diagnosis</div>
      <div style="margin-bottom: 4px;"><strong>Reported Symptoms:</strong> ${item.symptoms}</div>
      <div><strong>Doctor Diagnosis:</strong> ${item.incidentType}</div>
    </div>

    <div class="presc-box">
      <div class="presc-title">💊 Prescribed Medicines &amp; Hostel Care Instructions</div>
      <div style="margin-bottom: 6px;"><strong>Medicines:</strong> ${item.medicineGiven || item.treatment}</div>
      <div><strong>Hostel Medicine Custodian:</strong> ${item.medicineIncharge || 'Hostel Warden'} &nbsp;•&nbsp; <strong>Status:</strong> ${item.status}</div>
    </div>

    <div class="sig-row">
      <div class="sig-col">
        <div class="sig-line"></div>
        <strong>Escort Staff / Warden Signature</strong>
      </div>
      <div class="sig-col">
        <div class="sig-line"></div>
        <strong>Consulting Doctor / Stamp</strong>
      </div>
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
    <Layout pageTitle="🏥 Student Medical & Doctor Escort Care">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>🩺</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            🏥 Student Medical &amp; Doctor Escort Care
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Strictly for Residential Students (150 Hostel Boarders) • Teacher &amp; Mentor Clinic Escort • Doctor Consultations • Parent Sync
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('emergency')}>
            🚨 Local Clinics &amp; Emergency Directory
          </button>
          {canEdit && (
            <button className="btn btn-primary btn-sm" onClick={openNewIncident}>
              + Log Doctor Escort Visit
            </button>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24
      }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>🩺</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Doctor Consultations</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Outside Clinic Visits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>🛌</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--gold-400)' }}>{stats.restingInHostel}</div>
            <div className="stat-label">Resting in Hostel Room</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Taking Prescribed Medicines</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>🚨</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats.hospitalShifted}</div>
            <div className="stat-label">Hospital Shifts / Trauma</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Kagal Civil Hospital</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>✅</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>{stats.resolved}</div>
            <div className="stat-label">Recovered &amp; Back to Class</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Fit for Academic Studies</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{
        display: 'flex', gap: 10, borderBottom: '1px solid var(--border)',
        marginBottom: 20, paddingBottom: 2
      }}>
        <button
          className={`tab-btn${activeTab === 'incidents' ? ' active' : ''}`}
          onClick={() => setActiveTab('incidents')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'incidents' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'incidents' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem'
          }}
        >
          📋 Doctor Escort Logs ({incidents.length})
        </button>

        <button
          className={`tab-btn${activeTab === 'emergency' ? ' active' : ''}`}
          onClick={() => setActiveTab('emergency')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'emergency' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'emergency' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem'
          }}
        >
          🚨 Local Clinics &amp; Emergency Directory (Bachani / Kagal)
        </button>
      </div>

      {/* Tab 1: Incidents List */}
      {activeTab === 'incidents' && (
        <div className="card">
          {/* Filters Bar */}
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '1 1 340px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search student, doctor, mentor, fever, symptom..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ maxWidth: 340 }}
              />
              <select
                className="form-control"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ maxWidth: 190 }}
              >
                <option value="all">All Care Statuses</option>
                <option value="Resting in Hostel">Resting in Hostel</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Resolved">Recovered & Back</option>
                <option value="Hospital Shifted">Hospital Shifted</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {filteredIncidents.length} of {incidents.length} doctor visits
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading doctor escort records...
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No medical escort records found matching your filters.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Visit ID</th>
                      <th>Date</th>
                      <th>Residential Student</th>
                      <th>Symptoms &amp; Diagnosis</th>
                      <th>Doctor &amp; Clinic Visited</th>
                      <th>Escort Staff / Mentor</th>
                      <th>Care Status</th>
                      <th>Parent Sync</th>
                      <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map(item => {
                      const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG['Resolved'];
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gold-400)' }}>
                            {item.id}
                          </td>
                          <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                            {item.date}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{item.studentName}</strong>
                              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>🏠 Hostel</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Class {item.class}-{item.section || 'A'} • {item.studentId}
                            </div>
                          </td>
                          <td style={{ maxWidth: 220, fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 600, color: '#ef4444' }}>{item.incidentType}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.symptoms}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                            {item.doctorName || item.attendedBy}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#60a5fa', fontWeight: 600 }}>
                            👤 {item.escortStaff || 'Hostel Staff'}
                          </td>
                          <td>
                            <span style={{
                              background: statusConf.bg, color: statusConf.color, border: `1px solid ${statusConf.border}`,
                              padding: '3px 9px', borderRadius: 12, fontSize: '0.74rem', fontWeight: 700, whiteSpace: 'nowrap'
                            }}>
                              {statusConf.label}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              background: 'rgba(16,185,129,0.12)', color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.3)',
                              padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                              display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'
                            }}>
                              <span>📱</span> Synced
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: 16 }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleViewSlip(item)}
                                title="View & Print Medical Slip"
                              >
                                📄 Slip
                              </button>
                              {canEdit && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => handleDeleteIncident(item.id)}
                                  title="Delete Incident"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Local Emergency & Clinics Directory */}
      {activeTab === 'emergency' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {LOCAL_MEDICAL_DIRECTORY.map((contact, idx) => (
            <div key={idx} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    fontSize: '0.72rem', textTransform: 'uppercase', background: 'rgba(239,68,68,0.12)',
                    color: '#ef4444', fontWeight: 800, padding: '2px 8px', borderRadius: 4, letterSpacing: '0.5px'
                  }}>
                    {contact.role}
                  </span>
                  <h4 style={{ margin: '8px 0 2px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {contact.name}
                  </h4>
                </div>
                <span style={{ fontSize: '1.8rem' }}>🏥</span>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8,
                border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.84rem'
              }}>
                <div>
                  <strong>📞 Direct Helpline:</strong> <a href={`tel:${contact.phone}`} style={{ color: 'var(--gold-400)', fontWeight: 800 }}>{contact.phone}</a>
                </div>
                <div>
                  <strong>📍 Location:</strong> <span style={{ color: 'var(--text-secondary)' }}>{contact.location}</span>
                </div>
                <div>
                  <strong>🕒 Timing:</strong> <span style={{ color: 'var(--text-secondary)' }}>{contact.timing}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: 6, marginTop: 4 }}>
                  ℹ️ {contact.notes}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <a
                  href={`tel:${contact.phone}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  📞 Call Clinic / Doctor
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Log New Doctor Escort Record */}
      {showIncidentModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 650, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">🩺 Log Doctor Escort &amp; Health Consultation</h3>
              <button className="modal-close" onClick={() => setShowIncidentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveIncident}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Student Selection - Strictly Residential */}
                <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, padding: 12 }}>
                  <label className="form-label" style={{ fontWeight: 800, color: '#60a5fa' }}>
                    Select Residential Student (150 Hostel Boarders) *
                  </label>
                  <select
                    className="form-control"
                    value={form.studentId}
                    onChange={e => setForm({ ...form, studentId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Residential Student --</option>
                    {residentialStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        🏠 {s.name} ({s.id}) — Class {s.class}-{s.section || 'A'} ({s.address || 'Hostel'})
                      </option>
                    ))}
                  </select>

                  {currentSelectedStudent && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                      <span>Class: <strong>{currentSelectedStudent.class}-{currentSelectedStudent.section || 'A'}</strong></span>
                      <span>Gender: <strong>{currentSelectedStudent.gender}</strong></span>
                      <span>Parent Contact: <strong>{currentSelectedStudent.contact}</strong></span>
                    </div>
                  )}
                </div>

                {/* Date & Escort Staff */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Consultation Date *</label>
                    <input
                      type="date" className="form-control"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Accompanying Staff / Escort Mentor *</label>
                    <select
                      className="form-control"
                      value={form.escortStaff}
                      onChange={e => setForm({ ...form, escortStaff: e.target.value })}
                      required
                    >
                      {DEFAULT_STAFF_ESCORTS.map((staff, idx) => (
                        <option key={idx} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Doctor & Clinic Visited */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Doctor / Clinic Visited *</label>
                    <select
                      className="form-control"
                      value={form.doctorName}
                      onChange={e => setForm({ ...form, doctorName: e.target.value })}
                      required
                    >
                      {DEFAULT_DOCTORS.map((doc, idx) => (
                        <option key={idx} value={doc}>{doc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Doctor's Diagnosis / Issue *</label>
                    <input
                      type="text" className="form-control" placeholder="e.g. Viral Fever, Sprain, Tonsillitis"
                      value={form.incidentType}
                      onChange={e => setForm({ ...form, incidentType: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Symptoms */}
                <div className="form-group">
                  <label className="form-label">Reported Symptoms &amp; Illness Condition *</label>
                  <textarea
                    rows={2} className="form-control" placeholder="e.g. Fever 101.4°F, chills, throat pain, severe weakness since morning..."
                    value={form.symptoms}
                    onChange={e => setForm({ ...form, symptoms: e.target.value })}
                    required
                  />
                </div>

                {/* Prescribed Medicines */}
                <div className="form-group">
                  <label className="form-label">Doctor's Prescribed Medicines &amp; Dosages *</label>
                  <textarea
                    rows={2} className="form-control" placeholder="e.g. Paracetamol 500mg (1 tab twice daily after food), Cough syrup 5ml bedtime, warm water..."
                    value={form.medicineGiven}
                    onChange={e => setForm({ ...form, medicineGiven: e.target.value, treatment: e.target.value })}
                    required
                  />
                </div>

                {/* Care Status & Medicine In-Charge */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Current Care Status *</label>
                    <select
                      className="form-control"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="Resting in Hostel">🛌 Resting in Hostel (Taking Medicines)</option>
                      <option value="Under Observation">🩺 Under Observation (Follow-up Tomorrow)</option>
                      <option value="Resolved">✅ Resolved (Recovered & Back to Class)</option>
                      <option value="Hospital Shifted">🚨 Hospital Shifted (Specialist Care)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hostel Medicine In-Charge</label>
                    <input
                      type="text" className="form-control" placeholder="e.g. Warden Sanjay Bhosale"
                      value={form.medicineIncharge}
                      onChange={e => setForm({ ...form, medicineIncharge: e.target.value })}
                    />
                  </div>
                </div>

                {/* Expense Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Consultation &amp; Medicine Cost (₹)</label>
                    <input
                      type="number" className="form-control"
                      value={form.medicalCost}
                      onChange={e => setForm({ ...form, medicalCost: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medical Expense Paid By</label>
                    <select
                      className="form-control"
                      value={form.costPaidBy}
                      onChange={e => setForm({ ...form, costPaidBy: e.target.value })}
                    >
                      <option value="School Emergency Health Fund">School Emergency Health Fund</option>
                      <option value="Deducted from Student Pocket Money">Deducted from Student Pocket Money</option>
                    </select>
                  </div>
                </div>

                {/* Parent Communication Note */}
                <div className="form-group">
                  <label className="form-label">Parent Communication Note (Visible on Parent Portal)</label>
                  <textarea
                    rows={2} className="form-control" placeholder="e.g. Spoke with student's mother via call. Student taken to Dr. Kulkarni, medicine given, resting comfortably in hostel room."
                    value={form.parentNote}
                    onChange={e => setForm({ ...form, parentNote: e.target.value })}
                  />
                </div>

                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.86rem', color: '#10b981', fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={form.guardianNotified}
                      onChange={e => setForm({ ...form, guardianNotified: e.target.checked })}
                    />
                    <span>📱 Automatically sync this consultation update to the student's Parent Portal</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowIncidentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : '💾 Save & Notify Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Print Medical Slip */}
      {showSlipModal && selectedIncident && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 className="modal-title">📄 Official Doctor Escort &amp; Prescription Slip</h3>
              <button className="modal-close" onClick={() => setShowSlipModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: 12, marginBottom: 14 }}>
                <h4 style={{ margin: 0, color: 'var(--gold-400)' }}>SHANTI GURUKUL RESIDENTIAL SCHOOL</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bachani, Tal. Kagal, Kolhapur • Residential Health Care</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, marginTop: 4, color: '#60a5fa' }}>DOCTOR ESCORT &amp; PRESCRIPTION PASS</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                <div><strong>Ref ID:</strong> {selectedIncident.id}</div>
                <div><strong>Visit Date:</strong> {selectedIncident.date}</div>
                <div><strong>Student:</strong> {selectedIncident.studentName}</div>
                <div><strong>Roll No:</strong> {selectedIncident.studentId}</div>
                <div><strong>Class:</strong> {selectedIncident.class}-{selectedIncident.section || 'A'} (🏠 Residential)</div>
                <div><strong>Blood Group:</strong> {selectedIncident.bloodGroup || 'O+'}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>Doctor &amp; Clinic:</strong> <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>{selectedIncident.doctorName || selectedIncident.attendedBy}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Escort Staff / Mentor:</strong> <span style={{ color: '#60a5fa', fontWeight: 700 }}>{selectedIncident.escortStaff || 'Hostel Staff'}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Diagnosis:</strong> <span style={{ color: '#ef4444', fontWeight: 700 }}>{selectedIncident.incidentType}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Symptoms:</strong> {selectedIncident.symptoms}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Prescribed Medicines:</strong> <span style={{ color: '#10b981', fontWeight: 600 }}>{selectedIncident.medicineGiven || selectedIncident.treatment}</span>
                </div>
                <div>
                  <strong>Hostel In-Charge:</strong> {selectedIncident.medicineIncharge || 'Hostel Warden'} &nbsp;•&nbsp; <strong>Status:</strong> {selectedIncident.status}
                </div>
              </div>

              {selectedIncident.parentNote && (
                <div style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '8px 12px', borderRadius: 6 }}>
                  💬 <strong>Parent Update:</strong> {selectedIncident.parentNote}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setShowSlipModal(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => handlePrintSlip(selectedIncident)}>🖨️ Print Slip</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
