import express from 'express';
import Medication from '../models/Medication.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all medications
router.get('/', authenticate, async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    const medications = await Medication.find(query).sort({ name: 1 });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get medication by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create medication (admin/pharmacist/doctor only)
router.post('/', authenticate, authorize('admin', 'pharmacist', 'doctor'), async (req, res) => {
  try {
    const medication = new Medication(req.body);
    await medication.save();
    res.status(201).json(medication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update medication (admin/pharmacist only)
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), async (req, res) => {
  try {
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete medication (admin/pharmacist only)
router.delete('/:id', authenticate, authorize('admin', 'pharmacist'), async (req, res) => {
  try {
    const medication = await Medication.findByIdAndDelete(req.params.id);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ message: 'Medication deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

