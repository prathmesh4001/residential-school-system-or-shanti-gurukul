import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  key:     { type: String, required: true, unique: true }, // e.g. 2026-09-29_10_A_class
  class:   { type: String, required: true },
  section: { type: String, default: 'A' },
  date:    { type: String, required: true },
  type:    { type: String, enum: ['class', 'hostel'], default: 'class' },
  records: [{
    id:     { type: String, required: true },
    status: { type: String, enum: ['P', 'A', 'L', 'SickBay', 'HomeLeave'], default: 'P' }
  }],
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
