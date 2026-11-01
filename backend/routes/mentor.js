import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('mentor'));

router.get('/',       (_req, res) => res.json(DB.mentor.getAll()));
router.get('/calls',  (_req, res) => res.json(DB.mentor.getCalls()));
router.post('/calls', (req, res) => res.status(201).json(DB.mentor.saveCall(req.body)));

router.get('/rollcall/:wingId', (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  res.json(DB.mentor.getRollCall(req.params.wingId, date) || {});
});
router.post('/rollcall/:wingId', (req, res) => {
  const date = req.body.date || new Date().toISOString().slice(0, 10);
  res.json(DB.mentor.saveRollCall(req.params.wingId, date, req.body));
});

router.post('/',      (req, res)  => res.status(201).json(DB.mentor.save(req.body)));
router.put('/:id',    (req, res)  => res.json(DB.mentor.save({ ...req.body, id: req.params.id })));
router.delete('/:id', (req, res)  => { DB.mentor.delete(req.params.id); res.json({ message: 'Deleted' }); });

export default router;
