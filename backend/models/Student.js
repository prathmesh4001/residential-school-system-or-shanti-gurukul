import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },
  rollNo:       { type: String, required: true },
  name:         { type: String, required: true },
  class:        { type: String, required: true },
  section:      { type: String, default: 'A' },
  type:         { type: String, enum: ['residential', 'day'], default: 'residential' },
  gender:       { type: String },
  contact:      { type: String },
  parentName:   { type: String },
  address:      { type: String },
  dob:          { type: String },
  bloodGroup:   { type: String },
  category:     { type: String, default: 'General' },
  academicYear: { type: String, default: '2026-27' },
  prevSchool:   { type: String },
  photo:        { type: String }
}, { timestamps: true });

export const Student = mongoose.model('Student', studentSchema);
export default Student;
