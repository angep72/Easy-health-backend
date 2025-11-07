import express from 'express';
import Pharmacy from '../models/Pharmacy.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all pharmacies
router.get('/', authenticate, async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find()
      .populate('pharmacist_id', 'full_name email')
      .sort({ name: 1 });
    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('pharmacist_id', 'full_name email');
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy by pharmacist ID
router.get('/pharmacist/:pharmacistId', authenticate, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ pharmacist_id: req.params.pharmacistId });
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pharmacy (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const pharmacy = new Pharmacy(req.body);
    await pharmacy.save();
    await pharmacy.populate('pharmacist_id', 'full_name email');
    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pharmacy (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('pharmacist_id', 'full_name email');
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pharmacy (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }
    res.json({ message: 'Pharmacy deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

