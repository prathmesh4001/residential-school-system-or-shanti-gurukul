import mongoose from 'mongoose';

const timetablePeriodSlotSchema = new mongoose.Schema({
  periodNumber: { type: Number, default: null },
  label:        { type: String, default: '' },
  startTime:    { type: String, required: true },
  endTime:      { type: String, required: true },
  duration:     { type: Number, default: 40 },
  subject:      { type: String, default: '' },
  teacherId:    { type: String, default: '' },
  teacherName:  { type: String, default: '' },
  room:         { type: String, default: '' },
  isBreak:      { type: Boolean, default: false }
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, default: '2024-2025' },
  status:       { type: String, enum: ['draft', 'published'], default: 'published' },
  version:      { type: Number, default: 1 },
  publishedAt:  { type: Date, default: Date.now },
  publishedBy:  { type: String, default: 'admin' },
  classes:      { type: mongoose.Schema.Types.Mixed, default: {} }, // classKey -> day -> [slots]
  config:       { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
