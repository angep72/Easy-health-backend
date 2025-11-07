import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
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
  pharmacy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'paid'],
    default: 'pending',
  },
  total_price: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
  signature_data: {
    type: String,
  },
  // Medication details - each prescription now represents one medication
  medication_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  dosage: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
  },
  unit_price: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Prescription', prescriptionSchema);

