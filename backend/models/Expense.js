import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  id:           { type: String, required: true, unique: true },
  studentId:    { type: String, required: true },
  studentName:  { type: String },
  date:         { type: String, required: true },
  category:     { type: String, default: 'Stationery' },
  amount:       { type: Number, required: true },
  txnType:      { type: String, enum: ['Expense', 'Deposit'], default: 'Expense' },
  description:  { type: String },
  receiptNo:    { type: String },
  incharge:     { type: String }
}, { timestamps: true });

export const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
