import mongoose from 'mongoose';

const insuranceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  coverage_percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Insurance', insuranceSchema);


