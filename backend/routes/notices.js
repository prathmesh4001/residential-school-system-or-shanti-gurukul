import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('notices'));

router.get('/',       (_req, res) => res.json(DB.notices.getAll()));
router.get('/recent', (req, res)  => res.json(DB.notices.getRecent(Number(req.query.n) || 5)));
router.post('/',      (req, res)  => res.status(201).json(DB.notices.save({ ...req.body, postedBy: req.user.username })));
router.put('/:id',    (req, res)  => res.json(DB.notices.save({ ...req.body, id: req.params.id })));
router.delete('/:id', (req, res)  => { DB.notices.delete(req.params.id); res.json({ message: 'Deleted' }); });

export default router;
