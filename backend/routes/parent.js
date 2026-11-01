import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('parent'));

// GET /api/parent/students — fetch wards visible to logged-in parent or all for admin/teachers
router.get('/students', (req, res) => {
  const allStudents = DB.students.getAll();
  const role = req.user?.role;
  const userName = req.user?.name || '';

  if (role === 'parent') {
    const cleanUserName = userName.replace(/^(mr\.|mrs\.|ms\.|dr\.)\s*/i, '').trim().toLowerCase();
    const wards = allStudents.filter(s => {
      const pName = (s.parentName || '').toLowerCase();
      return pName.includes(cleanUserName) || cleanUserName.includes(pName);
    });
    // Default to first student (e.g. Aarav Sharma) if no exact match found
    if (wards.length === 0 && allStudents.length > 0) {
      return res.json([allStudents[0]]);
    }
    return res.json(wards);
  }

  res.json(allStudents);
});

// Parent portal: read comprehensive 360° student dossier & parent communications
router.get('/student/:id', (req, res) => {
  const student = DB.students.getById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const attendance = DB.attendance.calcPercent(student.id);
  const feeStatus  = (() => {
    const total = DB.fees.getFeeForStudent(student);
    const paid  = DB.fees.getTotalPaid(student.id);
    return { total, paid, pending: Math.max(0, total - paid) };
  })();
  const feePayments = DB.fees.getStudentPayments(student.id);
  const results     = DB.results.getByStudent(student.id);
  const notices     = DB.notices.getRecent(8);
  const achievements = DB.achievements.getAll().filter(
    a => a.studentId === student.id || a.name?.toLowerCase() === student.name?.toLowerCase()
  );
  const expenses    = DB.expenses.getByStudent(student.id);
  const totalSpent  = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pocketBalance = Math.max(0, 3000 - totalSpent); // Starting monthly pocket fund: ₹3,000

  const medical     = DB.medical.getByStudent(student.id);
  const messMenu    = DB.mess.getMenu();

  // Curated parent communication messages feed
  const messages = [];

  // 1. Fee messages
  if (feePayments.length > 0) {
    const latestPay = feePayments[feePayments.length - 1];
    messages.push({
      id: `MSG-FEE-${latestPay.id || '1'}`,
      category: 'fee',
      title: 'Fee Payment Receipt Issued',
      timestamp: latestPay.date || latestPay.createdAt || 'Recent',
      icon: '💰',
      badge: 'Receipt',
      content: `Receipt #${latestPay.receiptNo || latestPay.id} generated for ₹${Number(latestPay.amount).toLocaleString('en-IN')}. Remaining fee balance: ₹${Number(feeStatus.pending).toLocaleString('en-IN')}.`
    });
  } else if (feeStatus.pending > 0) {
    messages.push({
      id: 'MSG-FEE-REMINDER',
      category: 'fee',
      title: 'Upcoming Term Fee Due Reminder',
      timestamp: 'Important',
      icon: '💰',
      badge: 'Due Reminder',
      content: `A balance of ₹${Number(feeStatus.pending).toLocaleString('en-IN')} is outstanding for the current academic session. Kindly clear before the upcoming term due date.`
    });
  }

  // 2. Achievement messages
  achievements.forEach(ach => {
    messages.push({
      id: `MSG-ACH-${ach.id}`,
      category: 'achievement',
      title: `Honor Achieved: ${ach.title}`,
      timestamp: ach.date || 'Recent',
      icon: '🏆',
      badge: ach.award || 'Winner',
      content: `Congratulations! ${student.name} was honored with ${ach.award || 'an award'} at the ${ach.level || 'District'} level for outstanding performance in ${ach.category}.`
    });
  });

  // 3. Medical & Doctor Escort messages
  medical.forEach(med => {
    const doctorStr = med.doctorName || med.attendedBy || 'Local Clinic Doctor';
    const escortStr = med.escortStaff ? `Escorted by: ${med.escortStaff}. ` : '';
    const medDetails = med.medicineGiven ? `Medicines: ${med.medicineGiven}. ` : '';
    messages.push({
      id: `MSG-MED-${med.id}`,
      category: 'medical',
      title: `Doctor Visit & Care: ${med.incidentType || 'Health Consultation'}`,
      timestamp: med.date || 'Recent',
      icon: '🩺',
      badge: med.status || 'Doctor Visited',
      content: `Medical update for ${student.name}. Symptoms: ${med.symptoms || 'Fever / sickness'}. ${escortStr}Examined at ${doctorStr}. ${medDetails}Status: ${med.status || 'Resting in Hostel'}. ${med.parentNote ? 'Note: ' + med.parentNote : ''}`
    });
  });

  // 4. Pocket money debit messages
  expenses.slice(-3).forEach(exp => {
    messages.push({
      id: `MSG-EXP-${exp.id}`,
      category: 'expense',
      title: `Pocket Money Debit: ₹${exp.amount}`,
      timestamp: exp.date || 'Recent',
      icon: '👛',
      badge: exp.category || 'Purchase',
      content: `Deduction of ₹${exp.amount} for "${exp.item || exp.description || 'Stationery / Tuck Shop'}". Remaining safe pocket balance: ₹${pocketBalance}.`
    });
  });

  // 4b. Mentor Check-in & Pastoral Care Calls
  const mentorCalls = DB.mentor.getCallsByStudent(student.id);
  mentorCalls.forEach(call => {
    messages.push({
      id: `MSG-MTR-${call.id}`,
      category: 'mentor',
      title: `Mentor Conversation (${call.mentorName})`,
      timestamp: call.date || 'Recent',
      icon: '📞',
      badge: `${call.category} • ${call.emotionalState || 'Settled'}`,
      content: `Mentor ${call.mentorName} called parent regarding ${call.category}. Summary: "${call.summary}". Ward state: ${call.emotionalState}.`
    });
  });

  // 5. Academic results message
  if (results.length > 0) {
    const latestRes = results[results.length - 1];
    messages.push({
      id: `MSG-RES-${latestRes.key || '1'}`,
      category: 'academic',
      title: `${latestRes.exam} ${latestRes.year || ''} Report Card Available`,
      timestamp: latestRes.savedAt ? latestRes.savedAt.slice(0, 10) : 'Recent',
      icon: '📝',
      badge: `${latestRes.percentage}% (Grade ${latestRes.grade})`,
      content: `${student.name} scored ${latestRes.percentage}% (${latestRes.pass ? 'PASSED' : 'REMEDIAL'}) in ${latestRes.exam}. Remark: ${latestRes.remark || 'Good academic consistency.'}`
    });
  }

  // 6. Mess Menu message
  messages.push({
    id: 'MSG-MESS-WEEKLY',
    category: 'mess',
    title: 'Nutritional 7-Day Mess Menu Active',
    timestamp: 'This Week',
    icon: '🍱',
    badge: 'Weekly Diet',
    content: 'The planned weekly Gurukul menu includes balanced nutrition with fresh vegetables, milk, lentils, whole-grain roti, and seasonal fruit.'
  });

  // 7. General Notices for Parents
  notices.slice(0, 2).forEach(n => {
    messages.push({
      id: `MSG-NOT-${n.id}`,
      category: 'notice',
      title: n.title,
      timestamp: n.date,
      icon: '📢',
      badge: n.priority || 'Notice',
      content: n.content
    });
  });

  res.json({
    student,
    attendance,
    feeStatus,
    feePayments,
    results,
    notices,
    achievements,
    expenses,
    pocketBalance,
    medical,
    messMenu,
    mentorCalls,
    messages
  });
});

export default router;
