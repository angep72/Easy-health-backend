import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
  appointment_date: {
    type: Date,
    required: true,
  },
  appointment_time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
  },
  reason: {
    type: String,
  },
  rejection_reason: {
    type: String,
  },
}, {
  timestamps: true,
});

appointmentSchema.index({ doctor_id: 1, appointment_date: 1, appointment_time: 1 }, { unique: true });

export default mongoose.model('Appointment', appointmentSchema);


