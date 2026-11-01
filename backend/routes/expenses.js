import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('expenses'));

router.get('/',            (_req, res) => res.json(DB.expenses.getAll()));
router.get('/student/:id', (req, res)  => res.json(DB.expenses.getByStudent(req.params.id)));
router.post('/',           (req, res)  => res.status(201).json(DB.expenses.save(req.body)));
router.put('/:id',         (req, res)  => res.json(DB.expenses.save({ ...req.body, id: req.params.id })));
router.delete('/:id',      (req, res)  => { DB.expenses.delete(req.params.id); res.json({ message: 'Deleted' }); });

export default router;
