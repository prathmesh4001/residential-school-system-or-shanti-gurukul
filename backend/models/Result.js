import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  key:        { type: String, required: true, unique: true },
  studentId:  { type: String, required: true },
  class:      { type: String, required: true },
  section:    { type: String, default: 'A' },
  exam:       { type: String, required: true },
  year:       { type: String, default: '2026' },
  subjects:   { type: Map, of: Number },
  total:      { type: Number },
  maxTotal:   { type: Number, default: 600 },
  percentage: { type: Number },
  grade:      { type: String },
  remark:     { type: String },
  pass:       { type: Boolean, default: true }
}, { timestamps: true });

export const Result = mongoose.model('Result', resultSchema);
export default Result;
