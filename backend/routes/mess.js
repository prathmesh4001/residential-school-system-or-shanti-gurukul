import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('mess'));

router.get('/',  (_req, res) => res.json(DB.mess.getMenu()));
router.put('/',  (req, res)  => { DB.mess.saveMenu(req.body); res.json({ message: 'Mess menu updated' }); });

export default router;
