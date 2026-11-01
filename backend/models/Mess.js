import mongoose from 'mongoose';

const messMenuSchema = new mongoose.Schema({
  day:       { type: String, required: true, unique: true }, // e.g. Monday, Tuesday...
  breakfast: { type: String, default: '' },
  lunch:     { type: String, default: '' },
  snacks:    { type: String, default: '' },
  dinner:    { type: String, default: '' }
}, { timestamps: true });

export const MessMenu = mongoose.model('MessMenu', messMenuSchema);
export default MessMenu;
