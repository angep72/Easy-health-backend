import mongoose from 'mongoose';

const vitalSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  nurse_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  blood_pressure: {
    type: String,
  },
  heart_rate: {
    type: Number,
  },
  temperature: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Vital', vitalSchema);


