import express from 'express';
import Hospital from '../models/Hospital.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all hospitals
router.get('/', authenticate, async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hospital by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hospital (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update hospital (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hospital (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    res.json({ message: 'Hospital deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


