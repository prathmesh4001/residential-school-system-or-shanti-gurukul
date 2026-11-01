import mongoose from 'mongoose';

const mentorSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  wing:        { type: String, required: true },
  rooms:       [{ type: String }],
  phone:       { type: String },
  color:       { type: String, default: '#3b82f6' },
  targetWards: { type: Number, default: 38 },
  notes:       { type: String }
}, { timestamps: true });

export const Mentor = mongoose.model('Mentor', mentorSchema);
export default Mentor;
