import mongoose from 'mongoose';

const medicalSchema = new mongoose.Schema({
  id:               { type: String, required: true, unique: true },
  studentId:        { type: String, required: true },
  studentName:      { type: String },
  class:            { type: String },
  section:          { type: String },
  date:             { type: String, required: true },
  incidentType:     { type: String, default: 'General Checkup' },
  severity:         { type: String, enum: ['Normal', 'Medium', 'Critical'], default: 'Normal' },
  symptoms:         { type: String },
  treatment:        { type: String },
  attendedBy:       { type: String, default: 'Campus Doctor' },
  guardianNotified: { type: Boolean, default: true },
  status:           { type: String, default: 'Resolved' },
  hospitalShifted:  { type: Boolean, default: false },
  bloodGroup:       { type: String },
  allergies:        { type: String }
}, { timestamps: true });

export const Medical = mongoose.model('Medical', medicalSchema);
export default Medical;
