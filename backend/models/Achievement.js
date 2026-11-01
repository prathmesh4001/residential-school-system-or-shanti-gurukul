import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true },
  studentId:   { type: String, required: true },
  name:        { type: String, required: true },
  category:    { type: String, default: 'Academic' },
  title:       { type: String, required: true },
  date:        { type: String, required: true },
  level:       { type: String, default: 'District' },
  award:       { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
