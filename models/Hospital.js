import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  description: {
    type: String,
  },
  consultation_fee: {
    type: Number,
    default: 0,
    min: 0,
  },
  lab_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Hospital', hospitalSchema);

