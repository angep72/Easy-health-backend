import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  payment_type: {
    type: String,
    enum: ['consultation', 'lab_test', 'medication'],
    required: true,
  },
  reference_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  insurance_coverage: {
    type: Number,
    default: 0,
  },
  patient_pays: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  payment_method: {
    type: String,
  },
  transaction_id: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Payment', paymentSchema);


