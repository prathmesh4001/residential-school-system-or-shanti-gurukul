import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  id:             { type: String, required: true, unique: true },
  name:           { type: String, required: true },
  role:           { type: String, default: 'teacher' },
  subject:        { type: String },
  qualification:  { type: String },
  phone:          { type: String },
  email:          { type: String },
  classTeacherOf: { type: String },
  joinDate:       { type: String }
}, { timestamps: true });

export const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
