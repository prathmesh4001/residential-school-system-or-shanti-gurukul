/* ============================================================
   FeesPage.jsx — Shanti Gurukul School ERP
   Fixed Annual Fee Management Model:
     - Day Scholars: ₹10,000 (Tuition, Exams, Library, Sports)
     - Residential:  ₹50,000 (Tuition, Hostel Room, Mess Food, Exams, Library, Sports)
     - 450 Students Total (300 Day + 150 Residential = ₹1.05 Cr Budget)
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

function formatINR(val) {
  return '₹' + Number(val || 0).toLocaleString('en-IN');
}

export default function FeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'principal';
  const { toasts, show: toast } = useToast();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Active Tab: 'pay' | 'day' | 'residential' | 'history'
  const [activeTab, setActiveTab] = useState('pay');

  // Core Data States
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter States
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [dayFilter, setDayFilter] = useState('all'); // 'all' | 'paid' | 'pending'
  const [resFilter, setResFilter] = useState('all');

  // Payment Form States
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(todayStr);
  const [payMode, setPayMode] = useState('UPI');
  const [payRef, setPayRef] = useState('');
  const [payRemark, setPayRemark] = useState('');
  const [isSavingPay, setIsSavingPay] = useState(false);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // ──────────────────────────────────────────────────────────
  // Data Fetching
  // ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsRes, paymentsRes, summaryRes] = await Promise.all([
        api.get('/students'),
        api.get('/fees/payments'),
        api.get('/fees/summary').catch(() => ({ data: null }))
      ]);

      setStudents(studentsRes.data || []);
      setPayments(paymentsRes.data || []);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load fees data:', err);
      toast('Failed to load fee information', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map each student with their fixed fee and payment summary
  const enrichedStudents = useMemo(() => {
    return students.map(s => {
      const isRes = s.type === 'residential';
      const fixedFee = isRes ? 50000 : 10000;
      const studentPayments = payments.filter(p => p.studentId === s.id);
      const paid = studentPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const pending = Math.max(0, fixedFee - paid);
      const status = pending === 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending');

      return {
        ...s,
        fixedFee,
        paid,
        pending,
        status,
        paymentCount: studentPayments.length
      };
    });
  }, [students, payments]);

  // Day Scholars vs Residential lists
  const dayScholars = useMemo(() => {
    return enrichedStudents.filter(s => s.type !== 'residential');
  }, [enrichedStudents]);

  const residentialStudents = useMemo(() => {
    return enrichedStudents.filter(s => s.type === 'residential');
  }, [enrichedStudents]);

  // Filtered Day Scholars
  const filteredDayScholars = useMemo(() => {
    return dayScholars.filter(s => {
      if (dayFilter === 'paid') return s.status === 'Paid';
      if (dayFilter === 'pending') return s.status !== 'Paid';
      return true;
    });
  }, [dayScholars, dayFilter]);

  // Filtered Residential Students
  const filteredResidential = useMemo(() => {
    return residentialStudents.filter(s => {
      if (resFilter === 'paid') return s.status === 'Paid';
      if (resFilter === 'pending') return s.status !== 'Paid';
      return true;
    });
  }, [residentialStudents, resFilter]);

  // Selected Student Details for Payment Tab
  const selectedStudentDetails = useMemo(() => {
    if (!selectedStudent) return null;
    return enrichedStudents.find(s => s.id === selectedStudent.id) || selectedStudent;
  }, [selectedStudent, enrichedStudents]);

  // Pick student for payment
  const handleSelectStudent = (s) => {
    setSelectedStudent(s);
    const enriched = enrichedStudents.find(x => x.id === s.id) || s;
    setPayAmount(enriched.pending > 0 ? String(enriched.pending) : '');
    setPayRemark('');
    setPayRef('');
    setActiveTab('pay');
  };

  // Quick Amount Buttons
  const handleQuickAmount = (amt) => {
    setPayAmount(String(amt));
  };

  // ──────────────────────────────────────────────────────────
  // Record Payment
  // ──────────────────────────────────────────────────────────
  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast('Please select a student first', 'error');
      return;
    }

    const amountNum = Number(payAmount);
    if (!amountNum || amountNum <= 0) {
      toast('Please enter a valid payment amount', 'error');
      return;
    }

    setIsSavingPay(true);
    try {
      const payload = {
        studentId: selectedStudent.id,
        amount: amountNum,
        date: payDate,
        mode: payMode,
        referenceNo: payRef,
        remark: payRemark || `Fee payment (${selectedStudent.type === 'residential' ? 'Residential' : 'Day Scholar'})`,
        receivedBy: user?.name || 'Accounts Office'
      };

      const res = await api.post('/fees/payments', payload);
      const saved = res.data;

      await loadData();
      toast(`Payment of ${formatINR(amountNum)} recorded successfully!`, 'success');

      // Open printable receipt automatically
      const enriched = enrichedStudents.find(x => x.id === selectedStudent.id);
      const newPaid = (enriched?.paid || 0) + amountNum;
      const newPending = Math.max(0, (enriched?.fixedFee || 10000) - newPaid);

      setReceiptData({
        ...saved,
        studentName: selectedStudent.name,
        rollNo: selectedStudent.rollNo || selectedStudent.id,
        studentClass: selectedStudent.class,
        studentSection: selectedStudent.section || 'A',
        studentType: selectedStudent.type,
        fixedFee: enriched?.fixedFee || (selectedStudent.type === 'residential' ? 50000 : 10000),
        totalPaid: newPaid,
        pendingBalance: newPending
      });
      setShowReceiptModal(true);

      setPayAmount('');
      setPayRemark('');
      setPayRef('');
    } catch (err) {
      console.error('Payment record error:', err);
      toast('Failed to record payment transaction', 'error');
    } finally {
      setIsSavingPay(false);
    }
  };

  // View existing receipt
  const handleViewReceipt = (payment) => {
    const s = enrichedStudents.find(x => x.id === payment.studentId) || {};
    setReceiptData({
      ...payment,
      studentName: s.name || payment.studentName || 'Student',
      rollNo: s.rollNo || payment.studentId,
      studentClass: s.class || '—',
      studentSection: s.section || 'A',
      studentType: s.type || 'residential',
      fixedFee: s.fixedFee || 50000,
      totalPaid: s.paid || payment.amount,
      pendingBalance: s.pending || 0
    });
    setShowReceiptModal(true);
  };

  // Print official receipt via isolated print frame (guarantees ONLY receipt prints)
  const handlePrintReceipt = (data) => {
    if (!data) return;
    const isRes = data.studentType === 'residential';
    const totalAnnual = isRes ? '₹50,000' : '₹10,000';
    const categoryLabel = isRes ? '🏠 Residential (Hostel & Mess)' : '☀️ Day Scholar';

    const rows = isRes ? `
      <tr><td>Academic Tuition Fee</td><td class="amt">₹15,000</td></tr>
      <tr><td>Hostel Accommodation Fee</td><td class="amt">₹15,000</td></tr>
      <tr><td>Mess & Nutrition (3 Meals + Snacks)</td><td class="amt">₹14,000</td></tr>
      <tr><td>Periodic Exams & Examination Material</td><td class="amt">₹2,000</td></tr>
      <tr><td>Library Access & Study Material</td><td class="amt">₹2,000</td></tr>
      <tr><td>Sports Coaching, Playground & Fitness</td><td class="amt">₹2,000</td></tr>
    ` : `
      <tr><td>Academic Tuition Fee</td><td class="amt">₹7,000</td></tr>
      <tr><td>Periodic Exams & Assessment</td><td class="amt">₹1,000</td></tr>
      <tr><td>Library Access & Reading Material</td><td class="amt">₹1,000</td></tr>
      <tr><td>Sports & Physical Education</td><td class="amt">₹1,000</td></tr>
    `;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Fee Receipt — ${data.receiptNo} — ${data.studentName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 18mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Times New Roman", serif;
      -webkit-font-smoothing: antialiased;
    }
    .receipt-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1.5px solid #0f172a;
      border-radius: 8px;
      padding: 24px 28px;
    }
    .school-header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .org-banner {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #d97706;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .school-title {
      font-size: 24px;
      font-weight: 900;
      color: #1e3a8a;
      letter-spacing: 1px;
      margin: 0;
    }
    .school-address {
      font-size: 11.5px;
      color: #475569;
      margin-top: 3px;
    }
    .school-motto {
      font-size: 11px;
      font-style: italic;
      color: #d97706;
      margin-top: 3px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12.5px;
      margin-bottom: 12px;
    }
    .receipt-no {
      font-weight: 800;
      color: #1e3a8a;
    }
    .student-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 16px;
      font-size: 12.5px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 14px;
    }
    .student-card strong {
      color: #0f172a;
    }
    table.breakdown-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
      margin-bottom: 16px;
      border: 1px solid #cbd5e1;
    }
    table.breakdown-table th {
      background: #1e3a8a !important;
      color: #ffffff !important;
      padding: 8px 12px;
      font-weight: 800;
      font-size: 11.5px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    table.breakdown-table th.amt {
      text-align: right;
    }
    table.breakdown-table td {
      padding: 7px 12px;
      color: #0f172a;
      font-weight: 600;
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
    }
    table.breakdown-table td.amt {
      text-align: right;
      font-weight: 700;
    }
    table.breakdown-table tr.total-row td {
      background: #f8fafc !important;
      border-top: 2px solid #0f172a !important;
      font-weight: 900;
      font-size: 13px;
    }
    .payment-summary {
      border: 1.5px solid #1e3a8a;
      background: #eff6ff;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 22px;
    }
    .amt-line {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 900;
      color: #1e3a8a;
    }
    .sub-line {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #475569;
      margin-top: 5px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 18px;
    }
    .seal-box {
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
    .seal-line {
      width: 110px;
      height: 38px;
      border-bottom: 1px dashed #94a3b8;
      margin: 0 auto 4px;
    }
    .sig-box {
      text-align: center;
      font-size: 12px;
    }
    .sig-line {
      width: 150px;
      border-bottom: 1.5px solid #0f172a;
      margin: 0 auto 5px;
    }
    .sig-school {
      font-size: 10px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="school-header">
      <div class="org-banner">RangBharti's</div>
      <h1 class="school-title">SHANTI GURUKUL</h1>
      <div class="school-address">Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234</div>
      <div class="school-motto">ज्ञानं परमं बलम् • Residential &amp; Day Boarding School</div>
    </div>

    <div class="meta-row">
      <div><strong>Receipt No:</strong> <span class="receipt-no">${data.receiptNo}</span></div>
      <div><strong>Date:</strong> <span>${data.date}</span></div>
    </div>

    <div class="student-card">
      <div><strong>Student Name:</strong> ${data.studentName}</div>
      <div><strong>Roll No:</strong> ${data.rollNo}</div>
      <div><strong>Class:</strong> ${data.studentClass}-${data.studentSection || 'A'}</div>
      <div><strong>Category:</strong> ${categoryLabel}</div>
    </div>

    <table class="breakdown-table">
      <thead>
        <tr>
          <th style="text-align:left;">PARTICULARS / COVERAGE</th>
          <th class="amt">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td>Total Fixed Annual Fee</td>
          <td class="amt">${totalAnnual}</td>
        </tr>
      </tbody>
    </table>

    <div class="payment-summary">
      <div class="amt-line">
        <span>AMOUNT RECEIVED:</span>
        <span>₹${Number(data.amount || 0).toLocaleString('en-IN')}</span>
      </div>
      <div class="sub-line">
        <span>Payment Mode: <strong>${data.mode}</strong> ${data.referenceNo ? '(' + data.referenceNo + ')' : ''}</span>
        <span>Pending Due Balance: <strong>₹${Number(data.pendingBalance || 0).toLocaleString('en-IN')}</strong></span>
      </div>
    </div>

    <div class="signatures">
      <div class="seal-box">
        <div class="seal-line"></div>
        Accounts Office Seal
      </div>
      <div class="sig-box">
        <div class="sig-line"></div>
        <strong>Authorized Signatory</strong>
        <div class="sig-school">Shanti Gurukul, Bachani</div>
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
        console.error('Print iframe error:', err);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1200);
      }
    }, 250);
  };

  // Filtered History
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const q = historySearch.toLowerCase();
      const s = enrichedStudents.find(x => x.id === p.studentId);
      return (
        (p.receiptNo && p.receiptNo.toLowerCase().includes(q)) ||
        (p.studentId && p.studentId.toLowerCase().includes(q)) ||
        (s?.name && s.name.toLowerCase().includes(q)) ||
        (p.mode && p.mode.toLowerCase().includes(q))
      );
    });
  }, [payments, historySearch, enrichedStudents]);

  return (
    <Layout>
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>💰</span> Fee Management
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Fixed Annual Fee: <strong>Day Scholars (₹10,000)</strong> • <strong>Residential Students (₹50,000)</strong> (Tuition, Hostel, Mess, Exams, Library & Sports)
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          🖨️ Print Fee Report
        </button>
      </div>

      {/* ── Top Summary KPI Cards (1.05 Cr Budget Projection) ── */}
      <div className="grid grid-4 mb-3">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>🏛️</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#3b82f6' }}>
              ₹1.05 Cr
            </div>
            <div className="stat-label">Total Annual Target (450 Students)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>💵</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>
              {formatINR(payments.reduce((sum, p) => sum + Number(p.amount || 0), 0))}
            </div>
            <div className="stat-label">Total Fee Collected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>⏳</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {formatINR(enrichedStudents.reduce((sum, s) => sum + s.pending, 0))}
            </div>
            <div className="stat-label">Uncollected Pending Balance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>⚠️</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {enrichedStudents.filter(s => s.pending > 0).length} Students
            </div>
            <div className="stat-label">Students with Pending Dues</div>
          </div>
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'pay', label: '💳 Record Payment & Receipt' },
          { id: 'day', label: `☀️ Day Scholars (₹10,000) • ${dayScholars.length}` },
          { id: 'residential', label: `🏠 Residential (₹50,000) • ${residentialStudents.length}` },
          { id: 'history', label: `📜 Payment History (${payments.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ fontWeight: 600 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: RECORD PAYMENT & RECEIPT
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'pay' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: 20, alignItems: 'start' }}>
          {/* Left Column: Quick Find Student */}
          <div className="card">
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text-primary)' }}>
              🔍 Find Student
            </h3>

            <input
              className="form-control mb-3"
              placeholder="Search by student name or roll..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 460, overflowY: 'auto' }}>
              {enrichedStudents
                .filter(s => {
                  const q = studentSearch.toLowerCase();
                  return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
                })
                .map(s => {
                  const isSelected = selectedStudent?.id === s.id;
                  const isRes = s.type === 'residential';

                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      style={{
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        border: isSelected ? '2px solid var(--gold-400)' : '1px solid var(--border)',
                        background: isSelected ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: isSelected ? 'var(--gold-400)' : 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {s.name}
                        </strong>
                        <span className={`badge ${isRes ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.68rem' }}>
                          {isRes ? '🏠 ₹50,000' : '☀️ ₹10,000'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        <span>Class {s.class}-{s.section || 'A'} • {s.rollNo || s.id}</span>
                        <span style={{ color: s.pending > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                          {s.pending > 0 ? `Due: ${formatINR(s.pending)}` : '✓ Fully Paid'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="card">
            {selectedStudentDetails ? (
              <form onSubmit={handleSavePayment}>
                {/* Student Fee Banner */}
                <div style={{
                  padding: 16, borderRadius: 10, marginBottom: 20,
                  background: selectedStudentDetails.type === 'residential' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)',
                  border: `1px solid ${selectedStudentDetails.type === 'residential' ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        {selectedStudentDetails.name}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Roll No: {selectedStudentDetails.rollNo || selectedStudentDetails.id} • Class: {selectedStudentDetails.class}-{selectedStudentDetails.section || 'A'}
                      </div>
                    </div>

                    <span className={`badge ${selectedStudentDetails.type === 'residential' ? 'badge-purple' : 'badge-blue'}`} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                      {selectedStudentDetails.type === 'residential' ? '🏠 Residential Student' : '☀️ Day Scholar'}
                    </span>
                  </div>

                  {/* Fee inclusions banner */}
                  <div style={{
                    fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 8,
                    paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)'
                  }}>
                    {selectedStudentDetails.type === 'residential' ? (
                      <>📦 <strong>Fixed Annual Fee includes:</strong> Tuition, Hostel Room, Mess Food (3 Meals), Exams, Library & Sports Fitness.</>
                    ) : (
                      <>📦 <strong>Fixed Annual Fee includes:</strong> Tuition, Periodic Exams, Library Access & Physical Education.</>
                    )}
                  </div>

                  {/* Financial Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14 }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fixed Annual Fee</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatINR(selectedStudentDetails.fixedFee)}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount Paid</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                        {formatINR(selectedStudentDetails.paid)}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Due Balance</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedStudentDetails.pending > 0 ? '#ef4444' : '#10b981' }}>
                        {formatINR(selectedStudentDetails.pending)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                {selectedStudentDetails.pending > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                      ⚡ Quick Fill Payment:
                    </label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleQuickAmount(selectedStudentDetails.pending)}
                      >
                        Pay Full Due ({formatINR(selectedStudentDetails.pending)})
                      </button>
                      {selectedStudentDetails.type === 'residential' ? (
                        <>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickAmount(25000)}>
                            Pay Term 1 (₹25,000)
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickAmount(10000)}>
                            Pay Installment (₹10,000)
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickAmount(5000)}>
                            Pay Term 1 (₹5,000)
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleQuickAmount(2500)}>
                            Pay Installment (₹2,500)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Payment Amount (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 10000"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Payment Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={payDate}
                      onChange={e => setPayDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="form-label">Payment Mode *</label>
                    <select
                      className="form-control"
                      value={payMode}
                      onChange={e => setPayMode(e.target.value)}
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash (School Office)</option>
                      <option value="Bank Transfer">NEFT / RTGS / Net Banking</option>
                      <option value="Cheque">Cheque</option>
                      <option value="DD">Demand Draft (DD)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Transaction / UTR / Cheque Ref No.</label>
                    <input
                      className="form-control"
                      placeholder="e.g. UPI-9843210492"
                      value={payRef}
                      onChange={e => setPayRef(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">Receipt Note / Remarks</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Term 1 annual fee installment"
                    value={payRemark}
                    onChange={e => setPayRemark(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSavingPay}
                    style={{ padding: '10px 24px', fontWeight: 700 }}
                  >
                    {isSavingPay ? 'Recording...' : '💾 Record Payment & Issue Official Receipt'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>👈</div>
                <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)' }}>Select a Student</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  Search and pick a student from the left column to view their fixed fee balance and record a payment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: DAY SCHOLARS (₹10,000)
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'day' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>☀️</span> Day Scholars Roster (Fixed ₹10,000 / Year)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                All 300 Day Scholars • Covers Tuition, Periodic Exams, Library & Physical Education
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'pending', 'paid'].map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${dayFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDayFilter(f)}
                >
                  {f === 'all' ? 'All Day Scholars' : f === 'pending' ? 'Pending Dues' : 'Fully Paid'}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Fixed Annual Fee</th>
                  <th>Amount Paid</th>
                  <th>Pending Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDayScholars.map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td>{s.rollNo || s.id}</td>
                    <td>Class {s.class}-{s.section || 'A'}</td>
                    <td style={{ fontWeight: 700 }}>₹10,000</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatINR(s.paid)}</td>
                    <td style={{ color: s.pending > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                      {s.pending > 0 ? formatINR(s.pending) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'Paid' ? 'badge-green' : s.status === 'Partial' ? 'badge-gold' : 'badge-red'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSelectStudent(s)}
                      >
                        💳 Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: RESIDENTIAL STUDENTS (₹50,000)
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'residential' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏠</span> Residential Students Roster (Fixed ₹50,000 / Year)
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                All 150 Hostel Residents • Covers Tuition, Hostel Room, Mess Food (3 Meals), Exams, Library & Sports
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'pending', 'paid'].map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${resFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setResFilter(f)}
                >
                  {f === 'all' ? 'All Residential' : f === 'pending' ? 'Pending Dues' : 'Fully Paid'}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Fixed Annual Fee</th>
                  <th>Amount Paid</th>
                  <th>Pending Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidential.map((s, idx) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td>{s.rollNo || s.id}</td>
                    <td>Class {s.class}-{s.section || 'A'}</td>
                    <td style={{ fontWeight: 700 }}>₹50,000</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatINR(s.paid)}</td>
                    <td style={{ color: s.pending > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                      {s.pending > 0 ? formatINR(s.pending) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${s.status === 'Paid' ? 'badge-green' : s.status === 'Partial' ? 'badge-gold' : 'badge-red'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleSelectStudent(s)}
                      >
                        💳 Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 4: PAYMENT HISTORY & RECEIPTS
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
              📜 Payment Transactions & Receipts History
            </h3>

            <input
              className="form-control"
              style={{ width: 260 }}
              placeholder="Search by receipt # or student..."
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
            />
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Student Type</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Remarks</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => {
                  const s = enrichedStudents.find(x => x.id === p.studentId);
                  const isRes = s?.type === 'residential';

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{p.receiptNo}</td>
                      <td>{p.date}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {s?.name || p.studentName || p.studentId}
                      </td>
                      <td>Class {s?.class || '—'}</td>
                      <td>
                        <span className={`badge ${isRes ? 'badge-purple' : 'badge-blue'}`}>
                          {isRes ? '🏠 Residential' : '☀️ Day'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#10b981' }}>{formatINR(p.amount)}</td>
                      <td>
                        <span className="badge badge-gold">{p.mode}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.remark || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleViewReceipt(p)}
                        >
                          🖨️ Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          OFFICIAL PRINTABLE RECEIPT MODAL
          ══════════════════════════════════════════════════════════ */}
      {showReceiptModal && receiptData && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 580, padding: 0 }}>
            {/* Modal Actions Header */}
            <div className="modal-actions-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Official School Fee Receipt</strong>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => handlePrintReceipt(receiptData)}>
                  🖨️ Print Receipt
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowReceiptModal(false)}>
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div id="printable-receipt-card" style={{ padding: 24, background: '#ffffff', color: '#0f172a', fontFamily: 'serif' }}>
              {/* Receipt Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 14 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: 2, color: '#d97706', textTransform: 'uppercase' }}>
                  RangBharti's
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: 1 }}>
                  SHANTI GURUKUL
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234
                </div>
                <div style={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#d97706', marginTop: 2 }}>
                  ज्ञानं परमं बलम् • Residential & Day Boarding School
                </div>
              </div>

              {/* Receipt Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 12 }}>
                <div>
                  <strong>Receipt No:</strong> <span style={{ color: '#1e3a8a' }}>{receiptData.receiptNo}</span>
                </div>
                <div>
                  <strong>Date:</strong> {receiptData.date}
                </div>
              </div>

              {/* Student Meta */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', marginBottom: 14, fontSize: '0.82rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div><strong>Student Name:</strong> {receiptData.studentName}</div>
                  <div><strong>Roll No:</strong> {receiptData.rollNo}</div>
                  <div><strong>Class:</strong> {receiptData.studentClass}-{receiptData.studentSection || 'A'}</div>
                  <div>
                    <strong>Category:</strong> {receiptData.studentType === 'residential' ? '🏠 Residential (Hostel & Mess)' : '☀️ Day Scholar'}
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Details */}
              <table className="receipt-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: 14, border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ background: '#1e3a8a' }}>
                    <th style={{ textAlign: 'left', padding: '8px 10px', color: '#ffffff', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                      PARTICULARS / COVERAGE
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 10px', color: '#ffffff', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>
                      AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.studentType === 'residential' ? (
                    <>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Academic Tuition Fee</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹15,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Hostel Accommodation Fee</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹15,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Mess & Nutrition (3 Meals + Snacks)</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹14,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Periodic Exams & Examination Material</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹2,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Library Access & Study Material</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹2,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Sports Coaching, Playground & Fitness</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹2,000</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Academic Tuition Fee</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹7,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Periodic Exams & Assessment</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹1,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Library Access & Reading Material</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹1,000</td>
                      </tr>
                      <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 10px', color: '#0f172a', fontWeight: 600 }}>Sports & Physical Education</td>
                        <td style={{ textAlign: 'right', padding: '6px 10px', color: '#0f172a', fontWeight: 700 }}>₹1,000</td>
                      </tr>
                    </>
                  )}
                  <tr style={{ background: '#f8fafc', borderTop: '2px solid #0f172a', fontWeight: 800 }}>
                    <td style={{ padding: '8px 10px', color: '#0f172a', fontWeight: 800 }}>Total Fixed Annual Fee</td>
                    <td style={{ textAlign: 'right', padding: '8px 10px', color: '#0f172a', fontWeight: 900, fontSize: '0.88rem' }}>
                      {receiptData.studentType === 'residential' ? '₹50,000' : '₹10,000'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Receipt Summary */}
              <div style={{ border: '1px solid #1e3a8a', background: '#eff6ff', padding: '10px 14px', borderRadius: 6, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900, color: '#1e3a8a' }}>
                  <span>AMOUNT RECEIVED:</span>
                  <span>{formatINR(receiptData.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>
                  <span>Payment Mode: <strong>{receiptData.mode}</strong> {receiptData.referenceNo ? `(${receiptData.referenceNo})` : ''}</span>
                  <span>Pending Due Balance: <strong>{formatINR(receiptData.pendingBalance)}</strong></span>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 20 }}>
                <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                  <div style={{ width: 100, height: 40, borderBottom: '1px dashed #cbd5e1', margin: '0 auto 4px' }} />
                  Accounts Office Seal
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ width: 140, borderBottom: '1px solid #0f172a', margin: '0 auto 4px' }} />
                  <strong>Authorized Signatory</strong>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Shanti Gurukul, Bachani</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
