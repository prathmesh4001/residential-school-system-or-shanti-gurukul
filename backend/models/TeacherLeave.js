import mongoose from 'mongoose';

const teacherLeaveSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true },
  staffId:     { type: String, required: true },
  staffName:   { type: String, required: true },
  leaveType:   { type: String, enum: ['Casual', 'Medical', 'Duty', 'Special'], default: 'Casual' },
  startDate:   { type: String, required: true },
  endDate:     { type: String, required: true },
  days:        { type: Number, default: 1 },
  reason:      { type: String, required: true },
  status:      { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy:  { type: String },
  substitutes: { type: Map, of: String },
  appliedAt:   { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const TeacherLeave = mongoose.model('TeacherLeave', teacherLeaveSchema);
export default TeacherLeave;
