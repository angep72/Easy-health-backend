import mongoose from 'mongoose';

const labTestTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('LabTestTemplate', labTestTemplateSchema);


