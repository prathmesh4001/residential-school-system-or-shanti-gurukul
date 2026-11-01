import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('fees'));

// GET /api/fees/summary
router.get('/summary', (_req, res) => res.json(DB.fees.getSummary()));

// GET /api/fees
router.get('/', (_req, res) => res.json(DB.fees.getAllPayments()));

// GET /api/fees/structure
router.get('/structure', (_req, res) => res.json(DB.fees.getStructure()));
router.put('/structure', (req, res) => { DB.fees.saveStructure(req.body); res.json({ message: 'Saved' }); });

// GET /api/fees/payments
router.get('/payments', (_req, res) => res.json(DB.fees.getAllPayments()));
router.get('/payments/:studentId', (req, res) => res.json(DB.fees.getStudentPayments(req.params.studentId)));
router.post('/payments', (req, res) => res.status(201).json(DB.fees.savePayment(req.body)));

// GET /api/fees/defaulters
router.get('/defaulters', (_req, res) => res.json(DB.fees.getDefaulters()));

// GET /api/fees/status/:studentId
router.get('/status/:studentId', (req, res) => {
  const s = DB.students.getById(req.params.studentId);
  if (!s) return res.status(404).json({ error: 'Student not found' });
  const total = DB.fees.getFeeForStudent(s);
  const paid  = DB.fees.getTotalPaid(s.id);
  res.json({
    student: s,
    category: s.type === 'residential' ? 'Residential' : 'Day Scholar',
    totalFee: total,
    paid,
    pending: Math.max(0, total - paid)
  });
});

export default router;
