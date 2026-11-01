import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  date:     { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  postedBy: { type: String, default: 'admin' },
  category: { type: String, default: 'General' }
}, { timestamps: true });

export const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
