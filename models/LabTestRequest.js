import mongoose from 'mongoose';

const labTestRequestSchema = new mongoose.Schema({
  consultation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true,
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
  lab_test_template_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTestTemplate',
    required: true,
  },
  hospital_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
  },
  status: {
    type: String,
    enum: ['awaiting_payment', 'pending', 'in_progress', 'completed'],
    default: 'awaiting_payment',
  },
  total_price: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('LabTestRequest', labTestRequestSchema);

