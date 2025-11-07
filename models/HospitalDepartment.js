import mongoose from 'mongoose';

const hospitalDepartmentSchema = new mongoose.Schema({
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
  consultation_fee: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

hospitalDepartmentSchema.index({ hospital_id: 1, department_id: 1 }, { unique: true });

export default mongoose.model('HospitalDepartment', hospitalDepartmentSchema);


