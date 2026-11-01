/* ============================================================
   ExpensesPage.jsx — Shanti Gurukul Student Pocket Money Ledger
   Features:
     - Student Personal Expense Disbursements (Stationery, Toiletries,
       Haircut, Bus Travel, Medicine, Uniform, Sundry)
     - Real-Time Balance Debit & Deductions
     - Parent Top-Up Deposits (UPI, Cash, NetBanking) with Instant Balance Credit
     - Individual Student Passbook Accounts & Printable Statements
     - Full Teacher / Mentor / Warden / Admin Access
   ============================================================ */
import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const CATEGORIES = [
  { key: 'Stationery', label: 'Stationery & Books',       icon: '📚', color: '#3b82f6' },
  { key: 'Toiletries', label: 'Personal Toiletries',       icon: '🧴', color: '#10b981' },
  { key: 'Medical',    label: 'Medical & Medicines',       icon: '💊', color: '#ef4444' },
  { key: 'Grooming',   label: 'Haircut & Grooming',        icon: '✂️', color: '#ec4899' },
  { key: 'Uniform',    label: 'Uniform & Cobbler',         icon: '👔', color: '#8b5cf6' },
  { key: 'Travel',     label: 'Holiday Bus / Travel',      icon: '🚌', color: '#06b6d4' },
  { key: 'Snacks',     label: 'Mess & Extra Nutrition',    icon: '🍎', color: '#f59e0b' },
  { key: 'Misc',       label: 'General / Sundry',          icon: '🏷️', color: '#94a3b8' },
];

const INCHARGE_OPTIONS = [
  'Mr. Sanjay Bhosale (Residential Mentor)',
  'Mr. Ramesh Shinde (Residential Mentor)',
  'Mr. Suresh Jadhav (Residential Mentor)',
  'Mr. Deepak Kadam (Residential Mentor)',
];

function formatCurrency(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export default function ExpensesPage() {
  const { user } = useAuth();
  // Allow teachers, mentors, wardens, principals, and admins to manage pocket money
  const canEdit = ['admin', 'warden', 'principal', 'teacher', 'mentor', 'staff'].includes(user?.role);

  // States
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'accounts' | 'summary'
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [selectedStudentAccount, setSelectedStudentAccount] = useState(null);
  const [saving, setSaving] = useState(false);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    studentId: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Stationery',
    amount: '',
    description: '',
    receiptNo: '',
    incharge: 'Mr. Sanjay Bhosale (Residential Mentor)'
  });

  const [depositForm, setDepositForm] = useState({
    studentId: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    mode: 'UPI',
    parentName: '',
    receiptNo: '',
    notes: 'Parent pocket money top-up'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, stuRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/students').catch(() => ({ data: [] }))
      ]);
      setExpenses(expRes.data || []);
      setStudents(stuRes.data || []);
    } catch {
      showToast('Could not load pocket money data from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived calculations: Stats & Accounts
  const stats = useMemo(() => {
    const expenseList = expenses.filter(e => e.txnType === 'Expense');
    const depositList = expenses.filter(e => e.txnType === 'Deposit');

    const totalSpent = expenseList.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
    const totalDeposited = depositList.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
    const poolBalance = totalDeposited - totalSpent;

    const thisMonthStr = new Date().toISOString().slice(0, 7);
    const thisMonthSpent = expenseList
      .filter(e => (e.date || '').startsWith(thisMonthStr))
      .reduce((acc, cur) => acc + Number(cur.amount || 0), 0);

    return { totalSpent, totalDeposited, poolBalance, thisMonthSpent, count: expenses.length };
  }, [expenses]);

  // Per student running balances map
  const studentAccounts = useMemo(() => {
    const map = {};
    students.forEach(s => {
      map[s.id] = {
        student: s,
        deposited: 0,
        spent: 0,
        txns: []
      };
    });

    // Sort transactions chronologically
    const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(e => {
      if (!map[e.studentId]) {
        map[e.studentId] = {
          student: { id: e.studentId, name: e.studentName || 'Student', class: '—', section: '—', hostelRoom: '—' },
          deposited: 0,
          spent: 0,
          txns: []
        };
      }
      if (e.txnType === 'Deposit') {
        map[e.studentId].deposited += Number(e.amount || 0);
      } else {
        map[e.studentId].spent += Number(e.amount || 0);
      }
      map[e.studentId].txns.push(e);
    });

    return Object.values(map).map(acc => {
      const balance = acc.deposited - acc.spent;
      let status = 'Good';
      if (balance <= 0) status = 'Exhausted (₹0)';
      else if (balance < 300) status = 'Low (< ₹300)';
      return { ...acc, balance, status };
    });
  }, [students, expenses]);

  // Quick map: studentId => current balance
  const studentBalanceMap = useMemo(() => {
    const map = {};
    studentAccounts.forEach(acc => {
      map[acc.student.id] = acc.balance;
    });
    return map;
  }, [studentAccounts]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const q = query.toLowerCase();
      const matchQ = !q ||
        e.studentName?.toLowerCase().includes(q) ||
        e.studentId?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.receiptNo?.toLowerCase().includes(q) ||
        e.incharge?.toLowerCase().includes(q);
      const matchCat = catFilter === 'all' || e.category === catFilter;
      return matchQ && matchCat;
    });
  }, [expenses, query, catFilter]);

  // Open Expense Modal (Disburse Money)
  const openNewExpense = (presetStudentId) => {
    const sId = typeof presetStudentId === 'string' && presetStudentId ? presetStudentId : (students[0]?.id || '');
    const defaultIncharge = 'Mr. Sanjay Bhosale (Residential Mentor)';

    setExpenseForm({
      studentId: sId,
      date: new Date().toISOString().slice(0, 10),
      category: 'Stationery',
      amount: '',
      description: '',
      receiptNo: 'BILL-' + Math.floor(4000 + Math.random() * 1000),
      incharge: defaultIncharge
    });
    setShowExpenseModal(true);
  };

  // Open Deposit Modal (Parent Top-Up)
  const openNewDeposit = (presetStudentId) => {
    const sId = typeof presetStudentId === 'string' && presetStudentId ? presetStudentId : (students[0]?.id || '');
    const stu = students.find(s => s.id === sId);

    setDepositForm({
      studentId: sId,
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      mode: 'UPI',
      parentName: stu?.parentName || 'Parent / Guardian',
      receiptNo: 'RCP-DEP-' + Math.floor(100 + Math.random() * 900),
      notes: 'Parent pocket money top-up'
    });
    setShowDepositModal(true);
  };

  // Submit Expense (Disbursement from Mentor/Teacher)
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      showToast('⚠️ Please enter a valid disbursement amount.');
      return;
    }
    setSaving(true);
    const stu = students.find(s => s.id === expenseForm.studentId);
    const curBal = studentBalanceMap[expenseForm.studentId] || 0;
    const debitAmt = Number(expenseForm.amount);
    const balAfter = curBal - debitAmt;

    const payload = {
      ...expenseForm,
      amount: debitAmt,
      studentName: stu?.name || 'Student',
      txnType: 'Expense',
      balanceAfter: balAfter
    };

    try {
      const res = await api.post('/expenses', payload);
      setExpenses([res.data, ...expenses]);
      setShowExpenseModal(false);
      showToast(`✅ Disbursed ${formatCurrency(debitAmt)} to ${stu?.name || 'student'}. New Balance: ${formatCurrency(balAfter)}`);
    } catch {
      showToast('❌ Failed to record expense.');
    } finally {
      setSaving(false);
    }
  };

  // Submit Parent Deposit
  const handleSaveDeposit = async (e) => {
    e.preventDefault();
    if (!depositForm.amount || Number(depositForm.amount) <= 0) {
      showToast('⚠️ Please enter a valid deposit amount.');
      return;
    }
    setSaving(true);
    const stu = students.find(s => s.id === depositForm.studentId);
    const curBal = studentBalanceMap[depositForm.studentId] || 0;
    const creditAmt = Number(depositForm.amount);
    const balAfter = curBal + creditAmt;

    const payload = {
      ...depositForm,
      amount: creditAmt,
      studentName: stu?.name || 'Student',
      txnType: 'Deposit',
      category: 'Deposit',
      description: `Parent Top-Up (${depositForm.mode}) — ${depositForm.parentName ? `By ${depositForm.parentName}` : 'Allowance'}`,
      incharge: 'Hostel Office / Warden',
      balanceAfter: balAfter
    };

    try {
      const res = await api.post('/expenses', payload);
      setExpenses([res.data, ...expenses]);
      setShowDepositModal(false);
      showToast(`✅ Credited ${formatCurrency(creditAmt)} to ${stu?.name || 'student'}. New Balance: ${formatCurrency(balAfter)}`);
    } catch {
      showToast('❌ Failed to record parent deposit.');
    } finally {
      setSaving(false);
    }
  };

  // Delete transaction
  const handleDeleteTxn = async (id) => {
    if (!window.confirm('Delete this transaction record?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => e.id !== id));
      showToast('Transaction record deleted.');
    } catch {
      showToast('Failed to delete transaction.');
    }
  };

  // View statement
  const handleViewStatement = (acc) => {
    setSelectedStudentAccount(acc);
    setShowStatementModal(true);
  };

  // Print Isolated Passbook Statement
  const handlePrintStatement = () => {
    if (!selectedStudentAccount) return;
    const { student, balance, deposited, spent, txns } = selectedStudentAccount;

    const rowsHtml = txns.map((t, idx) => {
      const isDep = t.txnType === 'Deposit';
      return `
        <tr>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;">${idx + 1}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;">${t.date}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-weight:700;color:#1e3a8a;">${t.receiptNo || t.id}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;">${t.category}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;">${t.description}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-size:10px;color:#475569;">${t.incharge || 'Hostel Office'}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:right;color:#15803d;font-weight:700;">${isDep ? `+${formatCurrency(t.amount)}` : '—'}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:right;color:#b91c1c;font-weight:700;">${!isDep ? `-${formatCurrency(t.amount)}` : '—'}</td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pocket Money Statement — ${student.name}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 10px; color: #0f172a; font-size: 11px; }
    .school-header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px; }
    .org-banner { font-size: 11px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px; }
    .school-title { font-size: 20px; font-weight: 900; color: #1e3a8a; margin: 3px 0; }
    .school-sub { font-size: 10px; color: #475569; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
    th { background: #1e3a8a; color: #ffffff; padding: 6px 8px; border: 1px solid #1e3a8a; text-align: left; }
    .sig-row { display: flex; justify-content: space-between; margin-top: 36px; padding-top: 10px; }
    .sig-col { text-align: center; width: 200px; }
    .sig-line { border-top: 1px solid #475569; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="school-header">
    <div class="org-banner">RangBharti's</div>
    <div class="school-title">SHANTI GURUKUL RESIDENTIAL SCHOOL</div>
    <div class="school-sub">Bachani, Tal. Kagal, Dist. Kolhapur, Maharashtra — 416234 • Student Pocket Money Safe Custody</div>
    <div style="font-size:12px;font-weight:800;color:#0f172a;margin-top:6px;text-transform:uppercase;">
      Student Personal Pocket Money Account Statement &amp; Passbook
    </div>
  </div>

  <div class="meta-box">
    <div><strong>Student Name:</strong> ${student.name}</div>
    <div><strong>Roll Number:</strong> ${student.rollNo || student.id}</div>
    <div><strong>Class &amp; Section:</strong> Class ${student.class}-${student.section || 'A'}</div>
    <div><strong>Hostel Room:</strong> Room ${student.hostelRoom || '201'}</div>
    <div><strong>Parent Name:</strong> ${student.parentName || 'Parent'}</div>
    <div><strong>Total Deposited:</strong> <span style="font-weight:800;color:#15803d;">${formatCurrency(deposited)}</span></div>
    <div><strong>Total Disbursed:</strong> <span style="font-weight:800;color:#b91c1c;">${formatCurrency(spent)}</span></div>
    <div><strong>Safe Balance:</strong> <span style="font-weight:900;color:#1e3a8a;font-size:13px;">${formatCurrency(balance)}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:25px;text-align:center;">#</th>
        <th style="width:75px;">Date</th>
        <th style="width:85px;">Ref / Bill</th>
        <th style="width:85px;">Category</th>
        <th>Description / Reason</th>
        <th style="width:110px;">Incharge</th>
        <th style="text-align:right;width:80px;">Deposit (+)</th>
        <th style="text-align:right;width:80px;">Debit (-)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="sig-row">
    <div class="sig-col">
      <div class="sig-line"></div>
      <strong>Campus Store / Mentor Incharge</strong>
      <div style="color:#64748b;font-size:10px;">Expense Disbursed</div>
    </div>
    <div class="sig-col">
      <div class="sig-line"></div>
      <strong>Hostel Warden / Accounts</strong>
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

  // Live calculation for Expense Modal preview
  const selectedExpStudentBalance = studentBalanceMap[expenseForm.studentId] || 0;
  const expAmountNumber = Number(expenseForm.amount) || 0;
  const expRemainingBalance = selectedExpStudentBalance - expAmountNumber;

  // Live calculation for Deposit Modal preview
  const selectedDepStudentBalance = studentBalanceMap[depositForm.studentId] || 0;
  const depAmountNumber = Number(depositForm.amount) || 0;
  const depNewBalance = selectedDepStudentBalance + depAmountNumber;

  return (
    <Layout pageTitle="Student Pocket Money & Expenses">
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--gold-500)',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>💰</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toastMsg}</span>
        </div>
      )}

      {/* Header with prominent Action Buttons */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            💸 Student Pocket Money & Expenses
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Personal Expense Ledger &bull; Parent Top-Up Custody &bull; Individual Student Statements
          </div>
        </div>

        {/* ALWAYS VISIBLE TO TEACHERS, MENTORS, WARDENS & ADMINS */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => openNewDeposit()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💳</span>
            <span>+ Add Parent Top-Up</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openNewExpense()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💸</span>
            <span>+ Record Expense / Disburse</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 24
      }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>🏦</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>{formatCurrency(stats.poolBalance)}</div>
            <div className="stat-label">Total Student Pool Balance</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>In Gurukul Safe Custody</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>💸</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#ef4444' }}>{formatCurrency(stats.totalSpent)}</div>
            <div className="stat-label">Total Expenses Disbursed</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Across All Categories</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>📅</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#3b82f6' }}>{formatCurrency(stats.thisMonthSpent)}</div>
            <div className="stat-label">Spent This Month</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Active Purchases</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>💳</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: 'var(--gold-400)' }}>{formatCurrency(stats.totalDeposited)}</div>
            <div className="stat-label">Total Parent Deposits</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Safely Credited</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex', gap: 10, borderBottom: '1px solid var(--border)',
        marginBottom: 20, paddingBottom: 2, overflowX: 'auto'
      }}>
        <button
          className={`tab-btn${activeTab === 'expenses' ? ' active' : ''}`}
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'expenses' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'expenses' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', whiteSpace: 'nowrap'
          }}
        >
          💸 Expense Records ({filteredExpenses.length})
        </button>

        <button
          className={`tab-btn${activeTab === 'accounts' ? ' active' : ''}`}
          onClick={() => setActiveTab('accounts')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'accounts' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'accounts' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', whiteSpace: 'nowrap'
          }}
        >
          🏦 Student Accounts ({studentAccounts.length})
        </button>

        <button
          className={`tab-btn${activeTab === 'summary' ? ' active' : ''}`}
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '10px 18px', background: 'none', border: 'none',
            borderBottom: activeTab === 'summary' ? '2px solid var(--gold-500)' : 'none',
            color: activeTab === 'summary' ? 'var(--gold-400)' : 'var(--text-secondary)',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', whiteSpace: 'nowrap'
          }}
        >
          📊 Category Breakdown
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: EXPENSE & DISBURSEMENT RECORDS
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'expenses' && (
        <div className="card">
          {/* Filter Bar */}
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search student, bill no, description, incharge..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ maxWidth: 360 }}
              />
              <select
                className="form-control"
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                style={{ maxWidth: 180 }}
              >
                <option value="all">All Categories</option>
                <option value="Deposit">💳 Parent Deposits</option>
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openNewDeposit()}>
                + Top-Up
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => openNewExpense()}>
                + Disburse
              </button>
            </div>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {filteredExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                No pocket money transaction records found matching your filters.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Date</th>
                      <th>Ref / Bill</th>
                      <th>Student</th>
                      <th>Category</th>
                      <th>Reason / Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th>Incharge</th>
                      <th style={{ textAlign: 'right', paddingRight: 16 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map(item => {
                      const isDep = item.txnType === 'Deposit';
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            {item.date}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: '0.82rem' }}>
                            {item.receiptNo || item.id}
                          </td>
                          <td>
                            <strong style={{ color: 'var(--text-primary)' }}>{item.studentName}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.studentId}</div>
                          </td>
                          <td>
                            <span style={{
                              padding: '2px 8px', borderRadius: 8, fontSize: '0.74rem', fontWeight: 700,
                              background: isDep ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                              color: isDep ? '#10b981' : '#3b82f6'
                            }}>
                              {item.category || (isDep ? 'Deposit' : 'Expense')}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.85rem', maxWidth: 280, color: 'var(--text-primary)' }}>
                            {item.description}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '0.92rem', color: isDep ? '#10b981' : '#ef4444' }}>
                            {isDep ? `+${formatCurrency(item.amount)}` : `-${formatCurrency(item.amount)}`}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {item.incharge || 'Hostel Office'}
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: 16 }}>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleDeleteTxn(item.id)}
                              title="Delete record"
                            >
                              🗑️
                            </button>
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

      {/* ══════════════════════════════════════════════════════════
          TAB 2: STUDENT INDIVIDUAL ACCOUNTS & RUNNING BALANCES
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'accounts' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="card-title">🏦 Student Individual Accounts & Running Balances</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Click 💸 Disburse to give money, 💳 Top-Up to deposit funds, or 📄 Statement to view ledger
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openNewDeposit()}>
                + Top-Up
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => openNewExpense()}>
                + Disburse
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>Student Name</th>
                    <th>Roll No</th>
                    <th>Class</th>
                    <th>Room</th>
                    <th style={{ textAlign: 'right' }}>Total Deposited</th>
                    <th style={{ textAlign: 'right' }}>Total Disbursed</th>
                    <th style={{ textAlign: 'right' }}>Available Balance</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: 16 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentAccounts.map(acc => {
                    const hasLowBal = acc.balance < 300 && acc.balance > 0;
                    const isExhausted = acc.balance <= 0;

                    return (
                      <tr key={acc.student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {acc.student.name}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{acc.student.rollNo || acc.student.id}</td>
                        <td><span className="badge badge-blue">Class {acc.student.class}-{acc.student.section || 'A'}</span></td>
                        <td>
                          <span style={{ color: 'var(--gold-400)', fontWeight: 700, fontSize: '0.82rem' }}>
                            {acc.student.hostelRoom ? `Room ${acc.student.hostelRoom}` : '—'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{formatCurrency(acc.deposited)}</td>
                        <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{formatCurrency(acc.spent)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '1rem', color: isExhausted ? 'var(--danger)' : hasLowBal ? '#f59e0b' : '#10b981' }}>
                          {formatCurrency(acc.balance)}
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 800,
                            background: isExhausted ? 'rgba(239,68,68,0.15)' : hasLowBal ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                            color: isExhausted ? '#ef4444' : hasLowBal ? '#f59e0b' : '#10b981'
                          }}>
                            {acc.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: 16 }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            {/* DISBURSE MONEY TO STUDENT */}
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.74rem', background: '#3b82f6', borderColor: '#3b82f6' }}
                              onClick={() => openNewExpense(acc.student.id)}
                              title="Disburse money to this student"
                            >
                              💸 Disburse
                            </button>

                            {/* ADD PARENT TOP-UP */}
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                              onClick={() => openNewDeposit(acc.student.id)}
                              title="Add parent deposit top-up"
                            >
                              💳 Top-Up
                            </button>

                            {/* PASSBOOK STATEMENT */}
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                              onClick={() => handleViewStatement(acc)}
                              title="View passbook statement"
                            >
                              📄 Statement
                            </button>
                          </div>
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

      {/* ══════════════════════════════════════════════════════════
          TAB 3: CATEGORY BREAKDOWN
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {CATEGORIES.map(cat => {
            const catItems = expenses.filter(e => e.category === cat.key && e.txnType === 'Expense');
            const total = catItems.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
            const pct = stats.totalSpent > 0 ? Math.round((total / stats.totalSpent) * 100) : 0;

            return (
              <div key={cat.key} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      fontSize: '1.5rem', background: `${cat.color}20`,
                      width: 44, height: 44, borderRadius: 10, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', border: `1px solid ${cat.color}40`
                    }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--text-primary)' }}>{cat.label}</h4>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{catItems.length} disbursements</div>
                    </div>
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{formatCurrency(total)}</strong>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, width: '100%', overflow: 'hidden', marginTop: 4
                }}>
                  <div style={{ background: cat.color, height: '100%', width: `${pct}%` }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                  {pct}% of total pocket money disbursements
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: RECORD EXPENSE / DISBURSE MONEY TO STUDENT
          ────────────────────────────────────────────────────────── */}
      {showExpenseModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💸</span> Disburse Pocket Money / Record Expense
                </h3>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Deducts disbursed amount from student's available pocket money balance in safe custody
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowExpenseModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveExpense}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Select Student */}
                <div className="form-group">
                  <label className="form-label">Select Student *</label>
                  <select
                    className="form-control"
                    value={expenseForm.studentId}
                    onChange={e => setExpenseForm({ ...expenseForm, studentId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => {
                      const bal = studentBalanceMap[s.id] || 0;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rollNo || s.id}) &bull; Class {s.class}-{s.section || 'A'} &bull; Balance: {formatCurrency(bal)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Live Balance Calculator Indicator */}
                {expenseForm.studentId && (
                  <div style={{
                    background: expRemainingBalance < 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                    border: expRemainingBalance < 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Current Balance: </span>
                      <strong style={{ color: '#fff' }}>{formatCurrency(selectedExpStudentBalance)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>After Debit: </span>
                      <strong style={{ color: expRemainingBalance < 0 ? '#ef4444' : '#10b981', fontSize: '0.98rem' }}>
                        {formatCurrency(expRemainingBalance)}
                      </strong>
                    </div>
                    {expRemainingBalance < 0 && (
                      <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>⚠️ Insufficient Funds</span>
                    )}
                  </div>
                )}

                {/* Category & Amount */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Expense Category *</label>
                    <select
                      className="form-control"
                      value={expenseForm.category}
                      onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Disburse Amount (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 250"
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Reason / Description */}
                <div className="form-group">
                  <label className="form-label">Reason / Item Description *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Geometry box, practical notebook, haircut, bus fare..."
                    value={expenseForm.description}
                    onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    required
                  />
                  {/* Quick suggestion tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {['Practical Notebooks & Pens', 'Toothpaste & Bathing Soap', 'Monthly Haircut', 'Bus Travel Ticket', 'Prescription Medicines'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setExpenseForm({ ...expenseForm, description: tag })}
                        style={{
                          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                          borderRadius: 4, padding: '2px 8px', fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer'
                        }}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Incharge / Disbursed By */}
                <div className="form-group">
                  <label className="form-label">Disbursing Hostel Mentor *</label>
                  <select
                    className="form-control"
                    value={expenseForm.incharge}
                    onChange={e => setExpenseForm({ ...expenseForm, incharge: e.target.value })}
                    required
                  >
                    {INCHARGE_OPTIONS.map(inc => (
                      <option key={inc} value={inc}>{inc}</option>
                    ))}
                  </select>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 6, marginTop: 8 }}>
                    {INCHARGE_OPTIONS.map(inc => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setExpenseForm({ ...expenseForm, incharge: inc })}
                        style={{
                          background: expenseForm.incharge === inc ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                          border: expenseForm.incharge === inc ? '1px solid #3b82f6' : '1px solid var(--border)',
                          borderRadius: 6, padding: '6px 10px', fontSize: '0.74rem',
                          color: expenseForm.incharge === inc ? '#60a5fa' : 'var(--text-secondary)',
                          fontWeight: expenseForm.incharge === inc ? 700 : 500,
                          cursor: 'pointer', textAlign: 'left'
                        }}
                      >
                        👨‍🏫 {inc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Voucher Ref */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={expenseForm.date}
                      onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bill / Voucher Ref</label>
                    <input
                      type="text"
                      className="form-control"
                      value={expenseForm.receiptNo}
                      onChange={e => setExpenseForm({ ...expenseForm, receiptNo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || (expRemainingBalance < 0 && !window.confirm)}
                >
                  {saving ? 'Processing...' : `💸 Confirm & Debit ${expenseForm.amount ? formatCurrency(expenseForm.amount) : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: RECORD PARENT TOP-UP DEPOSIT
          ────────────────────────────────────────────────────────── */}
      {showDepositModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🏦</span> Record Parent Top-Up Deposit
                </h3>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Increases student's available pocket money balance in safe custody
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowDepositModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveDeposit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Select Student */}
                <div className="form-group">
                  <label className="form-label">Select Student *</label>
                  <select
                    className="form-control"
                    value={depositForm.studentId}
                    onChange={e => {
                      const stu = students.find(s => s.id === e.target.value);
                      setDepositForm({
                        ...depositForm,
                        studentId: e.target.value,
                        parentName: stu?.parentName ? `${stu.parentName} (${stu.parentRelation || 'Parent'})` : 'Parent / Guardian'
                      });
                    }}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => {
                      const bal = studentBalanceMap[s.id] || 0;
                      return (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rollNo || s.id}) &bull; Class {s.class}-{s.section || 'A'} &bull; Balance: {formatCurrency(bal)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Live Balance Preview Indicator */}
                {depositForm.studentId && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Current Balance: </span>
                      <strong style={{ color: '#fff' }}>{formatCurrency(selectedDepStudentBalance)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>After Deposit: </span>
                      <strong style={{ color: '#10b981', fontSize: '1.05rem' }}>
                        {formatCurrency(depNewBalance)}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Deposit Amount & Mode */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Deposit Amount (₹) *</label>
                    <input
                      type="number"
                      min="50"
                      className="form-control"
                      placeholder="e.g. 1500"
                      value={depositForm.amount}
                      onChange={e => setDepositForm({ ...depositForm, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Mode *</label>
                    <select
                      className="form-control"
                      value={depositForm.mode}
                      onChange={e => setDepositForm({ ...depositForm, mode: e.target.value })}
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash at Hostel Desk</option>
                      <option value="NetBanking">Net Banking / NEFT</option>
                    </select>
                  </div>
                </div>

                {/* Parent / Depositor Name */}
                <div className="form-group">
                  <label className="form-label">Parent / Depositor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rajesh Sharma (Father)"
                    value={depositForm.parentName}
                    onChange={e => setDepositForm({ ...depositForm, parentName: e.target.value })}
                  />
                </div>

                {/* Date & Receipt */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={depositForm.date}
                      onChange={e => setDepositForm({ ...depositForm, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deposit Receipt Ref</label>
                    <input
                      type="text"
                      className="form-control"
                      value={depositForm.receiptNo}
                      onChange={e => setDepositForm({ ...depositForm, receiptNo: e.target.value })}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Notes / Parent Remarks</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Monthly pocket money allowance sent by guardian"
                    value={depositForm.notes}
                    onChange={e => setDepositForm({ ...depositForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDepositModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Crediting...' : `💳 Confirm & Credit ${depositForm.amount ? formatCurrency(depositForm.amount) : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: VIEW STUDENT PASSBOOK STATEMENT
          ────────────────────────────────────────────────────────── */}
      {showStatementModal && selectedStudentAccount && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">📄 Student Pocket Money Statement & Passbook</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Complete transaction history of deposits and personal disbursements
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowStatementModal(false)}>✕</button>
            </div>

            <div className="modal-body" style={{ fontSize: '0.88rem' }}>
              {/* Account Summary Banner */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '12px 16px', marginBottom: 16
              }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {selectedStudentAccount.student.name}
                  </h4>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Roll: <strong>{selectedStudentAccount.student.rollNo || selectedStudentAccount.student.id}</strong> &bull; Class {selectedStudentAccount.student.class}-{selectedStudentAccount.student.section || 'A'} &bull; Room {selectedStudentAccount.student.hostelRoom || '201'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Safe Custody Balance</div>
                  <strong style={{ fontSize: '1.3rem', color: '#10b981' }}>
                    {formatCurrency(selectedStudentAccount.balance)}
                  </strong>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="table-responsive" style={{ maxHeight: 320, overflowY: 'auto' }}>
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Ref</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Deposit (+)</th>
                      <th style={{ textAlign: 'right' }}>Debit (-)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentAccount.txns.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                          No transactions recorded for this student yet.
                        </td>
                      </tr>
                    ) : (
                      selectedStudentAccount.txns.map(t => {
                        const isDep = t.txnType === 'Deposit';
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ whiteSpace: 'nowrap' }}>{t.date}</td>
                            <td style={{ color: 'var(--gold-400)', fontWeight: 700 }}>{t.receiptNo || t.id}</td>
                            <td>{t.category}</td>
                            <td style={{ maxWidth: 220 }}>{t.description}</td>
                            <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                              {isDep ? `+${formatCurrency(t.amount)}` : '—'}
                            </td>
                            <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>
                              {!isDep ? `-${formatCurrency(t.amount)}` : '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handlePrintStatement}
              >
                🖨️ Print Passbook Statement
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowStatementModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
