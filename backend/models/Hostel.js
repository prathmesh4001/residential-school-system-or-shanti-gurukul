import mongoose from 'mongoose';

const hostelRoomSchema = new mongoose.Schema({
  roomNo:   { type: String, required: true, unique: true },
  floor:    { type: String, default: '1st' },
  capacity: { type: Number, default: 4 },
  type:     { type: String, enum: ['boys', 'girls'], default: 'boys' },
  students: [{ type: String }]
}, { timestamps: true });

const hostelLeaveSchema = new mongoose.Schema({
  id:         { type: String, required: true, unique: true },
  studentId:  { type: String, required: true },
  leaveDate:  { type: String, required: true },
  returnDate: { type: String, required: true },
  reason:     { type: String },
  status:     { type: String, enum: ['out', 'returned'], default: 'out' }
}, { timestamps: true });

export const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);
export const HostelLeave = mongoose.model('HostelLeave', hostelLeaveSchema);
export default { HostelRoom, HostelLeave };
