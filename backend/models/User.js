import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name:     { type: String, required: true },
  role:     { type: String, enum: ['admin', 'principal', 'teacher', 'warden', 'mentor', 'parent'], required: true },
  email:    { type: String },
  studentId:{ type: String } // for parents
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export default User;
