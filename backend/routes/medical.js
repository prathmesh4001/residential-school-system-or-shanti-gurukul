import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('medical'));

router.get('/',           (_req, res) => res.json(DB.medical.getAll()));
router.get('/student/:id', (req, res) => res.json(DB.medical.getByStudent(req.params.id)));
router.post('/',          (req, res)  => res.status(201).json(DB.medical.save(req.body)));
router.put('/:id',        (req, res)  => res.json(DB.medical.save({ ...req.body, id: req.params.id })));
router.delete('/:id',     (req, res)  => { DB.medical.delete(req.params.id); res.json({ message: 'Deleted' }); });

export default router;
