import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('results'));

router.get('/',                      (_req, res) => res.json(DB.results.getAll()));
router.get('/student/:id',           (req, res)  => res.json(DB.results.getByStudent(req.params.id)));
router.get('/class',                 (req, res)  => {
  const { cls, section, exam, year } = req.query;
  res.json(DB.results.getClassResults(cls, section, exam, year));
});
router.post('/',                     (req, res)  => res.status(201).json(DB.results.save(req.body)));

export default router;
