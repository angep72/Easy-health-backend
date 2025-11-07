import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    unique: true,
  },
  hospital_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  specialization: {
    type: String,
  },
  license_number: {
    type: String,
    required: true,
    unique: true,
  },
  consultation_fee: {
    type: Number,
    required: true,
    default: 0,
  },
  signature_data: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Doctor', doctorSchema);


