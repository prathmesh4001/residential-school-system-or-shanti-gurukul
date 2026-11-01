import mongoose from 'mongoose';

const sportsSchema = new mongoose.Schema({
  id:       { type: String, required: true, unique: true },
  name:     { type: String, required: true },
  category: { type: String, enum: ['indoor', 'outdoor', 'athletics'], default: 'outdoor' },
  members:  [{ type: String }],
  coach:    { type: String },
  schedule: { type: String }
}, { timestamps: true });

export const Sports = mongoose.model('Sports', sportsSchema);
export default Sports;
