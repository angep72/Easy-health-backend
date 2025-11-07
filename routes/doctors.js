import express from 'express';
import Doctor from '../models/Doctor.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors
router.get('/', authenticate, async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user_id', 'full_name email phone')
      .populate('hospital_id')
      .populate('department_id')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user_id', 'full_name email phone')
      .populate('hospital_id')
      .populate('department_id');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by user ID
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user_id: req.params.userId })
      .populate('user_id', 'full_name email phone')
      .populate('hospital_id')
      .populate('department_id');
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create doctor (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    await doctor.populate('user_id', 'full_name email phone');
    await doctor.populate('hospital_id');
    await doctor.populate('department_id');
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update doctor
router.put('/:id', authenticate, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Doctors can update their own profile, admins can update any
    if (req.user.role !== 'admin' && doctor.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('user_id', 'full_name email phone')
      .populate('hospital_id')
      .populate('department_id');
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete doctor (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


