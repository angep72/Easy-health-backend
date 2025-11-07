import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true,
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  diagnosis: {
    type: String,
  },
  notes: {
    type: String,
  },
  requires_lab_test: {
    type: Boolean,
    default: false,
  },
  requires_prescription: {
    type: Boolean,
    default: false,
  },
  consultation_date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Consultation', consultationSchema);


