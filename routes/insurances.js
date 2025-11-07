import express from 'express';
import Insurance from '../models/Insurance.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all insurances
router.get('/', authenticate, async (req, res) => {
  try {
    const insurances = await Insurance.find().sort({ name: 1 });
    res.json(insurances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get insurance by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const insurance = await Insurance.findById(req.params.id);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    res.json(insurance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create insurance (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const insurance = new Insurance(req.body);
    await insurance.save();
    res.status(201).json(insurance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update insurance (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const insurance = await Insurance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    res.json(insurance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete insurance (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const insurance = await Insurance.findByIdAndDelete(req.params.id);
    if (!insurance) {
      return res.status(404).json({ error: 'Insurance not found' });
    }
    res.json({ message: 'Insurance deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


