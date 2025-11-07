import mongoose from 'mongoose';

const pharmacyRequestSchema = new mongoose.Schema({
  prescription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true,
  },
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  pharmacy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  rejection_reason: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('PharmacyRequest', pharmacyRequestSchema);


