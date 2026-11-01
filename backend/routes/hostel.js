import express from 'express';
import { authenticate, canAccess } from '../middleware/auth.js';
import { DB } from '../data/store.js';
const router = express.Router();

router.use(authenticate);
router.use(canAccess('hostel'));

router.get('/rooms',             (_req, res)  => res.json(DB.hostel.getRooms()));
router.get('/rooms/:roomNo',     (req, res)   => { const r = DB.hostel.getRoom(req.params.roomNo); r ? res.json(r) : res.status(404).json({ error: 'Room not found' }); });
router.post('/rooms',            (req, res)   => { DB.hostel.saveRoom(req.body); res.status(201).json({ message: 'Saved' }); });
router.put('/rooms/:roomNo',     (req, res)   => { DB.hostel.saveRoom({ ...req.body, roomNo: req.params.roomNo }); res.json({ message: 'Updated' }); });
router.delete('/rooms/:roomNo',  (req, res)   => { DB.hostel.deleteRoom(req.params.roomNo); res.json({ message: 'Deleted' }); });
router.post('/rooms/:roomNo/allocate',   (req, res) => {
  const ok = DB.hostel.allocate(req.params.roomNo, req.body.studentId);
  ok ? res.json({ message: 'Allocated' }) : res.status(400).json({ error: 'Cannot allocate (full or already assigned)' });
});
router.post('/rooms/:roomNo/deallocate', (req, res) => {
  DB.hostel.deallocate(req.body.studentId);
  res.json({ message: 'Deallocated' });
});
router.get('/student/:id/room',  (req, res)   => res.json(DB.hostel.getStudentRoom(req.params.id) || null));
router.get('/leaves',            (_req, res)  => res.json(DB.hostel.getLeaves()));
router.post('/leaves',           (req, res)   => { DB.hostel.saveLeave(req.body); res.status(201).json({ message: 'Leave recorded' }); });
router.put('/leaves/:id',        (req, res)   => {
  const leaves = DB.hostel.getLeaves();
  const item = leaves.find(l => l.id === req.params.id);
  if (item) {
    Object.assign(item, req.body);
    res.json({ message: 'Updated', leave: item });
  } else {
    res.status(404).json({ error: 'Leave not found' });
  }
});

export default router;
