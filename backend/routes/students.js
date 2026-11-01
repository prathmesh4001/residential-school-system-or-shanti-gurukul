import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('students'));

router.get('/',        (_req, res) => res.json(DB.students.getAll()));
router.get('/stats',   (_req, res) => res.json(DB.students.getStats()));
router.get('/search',  (req, res)  => res.json(DB.students.search(req.query.q || '')));
router.get('/:id',     (req, res)  => { const s = DB.students.getById(req.params.id); s ? res.json(s) : res.status(404).json({ error: 'Student not found' }); });
router.post('/',       (req, res)  => res.status(201).json(DB.students.save(req.body)));
router.put('/:id',     (req, res)  => res.json(DB.students.save({ ...req.body, id: req.params.id })));
router.delete('/:id',  (req, res)  => { DB.students.delete(req.params.id); res.json({ message: 'Deleted' }); });

export default router;
