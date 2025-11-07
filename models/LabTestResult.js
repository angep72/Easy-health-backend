import mongoose from 'mongoose';

const labTestResultSchema = new mongoose.Schema({
  lab_test_request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTestRequest',
    required: true,
    unique: true,
  },
  technician_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  result_status: {
    type: String,
    enum: ['positive', 'negative', 'inconclusive'],
    required: true,
  },
  result_data: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  completed_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('LabTestResult', labTestResultSchema);


