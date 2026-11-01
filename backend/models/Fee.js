import mongoose from 'mongoose';

const feePaymentSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  receiptNo: { type: String, required: true },
  studentId: { type: String, required: true },
  amount:    { type: Number, required: true },
  date:      { type: String, required: true },
  mode:      { type: String, default: 'Cash' },
  remark:    { type: String }
}, { timestamps: true });

export const FeePayment = mongoose.model('FeePayment', feePaymentSchema);
export default FeePayment;
