import express from 'express';
import Vital from '../models/Vital.js';
import Nurse from '../models/Nurse.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get vitals
router.get('/', authenticate, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'patient') {
      query.patient_id = req.user._id;
    } else if (req.user.role === 'nurse') {
      // Nurses can see vitals they recorded
      query.nurse_id = req.user._id;
    }

    const vitals = await Vital.find(query)
      .populate('patient_id', 'full_name')
      .populate('nurse_id', 'full_name')
      .sort({ createdAt: -1 });

    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vitals by patient ID
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const vitals = await Vital.find({ patient_id: req.params.patientId })
      .populate('patient_id', 'full_name')
      .populate('nurse_id', 'full_name')
      .sort({ createdAt: -1 });

    res.json(vitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create vital (nurse only)
router.post('/', authenticate, authorize('nurse'), async (req, res) => {
  try {
    const vital = new Vital({
      ...req.body,
      nurse_id: req.user._id,
    });
    await vital.save();
    await vital.populate('patient_id', 'full_name');
    await vital.populate('nurse_id', 'full_name');
    res.status(201).json(vital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vital by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const vital = await Vital.findById(req.params.id)
      .populate('patient_id', 'full_name')
      .populate('nurse_id', 'full_name');

    if (!vital) {
      return res.status(404).json({ error: 'Vital not found' });
    }

    res.json(vital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


