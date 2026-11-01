import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('achievements'));

router.get('/',       (_req, res) => res.json(DB.achievements.getAll()));
router.post('/',      (req, res)  => res.status(201).json(DB.achievements.save(req.body)));
router.put('/:id',    (req, res)  => res.json(DB.achievements.save({ ...req.body, id: req.params.id })));
router.delete('/:id', (req, res)  => { DB.achievements.delete(req.params.id); res.json({ message: 'Deleted' }); });

export default router;
