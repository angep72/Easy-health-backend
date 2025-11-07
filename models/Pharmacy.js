import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
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
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  pharmacist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Pharmacy', pharmacySchema);


