import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema({
  prescription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true,
  },
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
    required: true,
    default: 0,
  },
  total_price: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('PrescriptionItem', prescriptionItemSchema);

