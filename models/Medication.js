import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  unit_price: {
    type: Number,
    required: true,
    default: 0,
  },
  stock_quantity: {
    type: Number,
    default: 0,
  },
  requires_prescription: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Medication', medicationSchema);


