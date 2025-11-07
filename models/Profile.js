import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'lab_technician', 'pharmacist', 'admin', 'nurse'],
    required: true,
  },
  phone: {
    type: String,
  },
  national_id: {
    type: String,
    unique: true,
    sparse: true,
  },
  insurance_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Insurance',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Profile', profileSchema);


