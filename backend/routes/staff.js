import express from 'express';
import { authenticate, canAccess, canWrite } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('staff'));

router.get('/',          (_req, res) => res.json(DB.staff.getAll()));
router.get('/teachers',    (_req, res) => res.json(DB.staff.getTeachers()));
router.get('/:id',       (req, res)  => { const s = DB.staff.getById(req.params.id); s ? res.json(s) : res.status(404).json({ error: 'Staff not found' }); });
router.post('/',         canWrite('staff'), (req, res)  => res.status(201).json(DB.staff.save(req.body)));
router.put('/:id',       canWrite('staff'), (req, res)  => res.json(DB.staff.save({ ...req.body, id: req.params.id })));
router.delete('/:id',    canWrite('staff'), (req, res)  => { DB.staff.delete(req.params.id); res.json({ message: 'Deleted' }); });

export default router;
