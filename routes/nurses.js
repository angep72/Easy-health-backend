import express from 'express';
import Nurse from '../models/Nurse.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all nurses
router.get('/', authenticate, async (req, res) => {
  try {
    const nurses = await Nurse.find()
      .populate('user_id', 'full_name email phone')
      .sort({ createdAt: -1 });
    res.json(nurses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nurse by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id)
      .populate('user_id', 'full_name email phone');
    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found' });
    }
    res.json(nurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nurse by user ID
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const nurse = await Nurse.findOne({ user_id: req.params.userId })
      .populate('user_id', 'full_name email phone');
    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found' });
    }
    res.json(nurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create nurse (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const nurse = new Nurse(req.body);
    await nurse.save();
    await nurse.populate('user_id', 'full_name email phone');
    res.status(201).json(nurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update nurse
router.put('/:id', authenticate, async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id);
    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found' });
    }

    if (req.user.role !== 'admin' && nurse.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedNurse = await Nurse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user_id', 'full_name email phone');
    res.json(updatedNurse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete nurse (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const nurse = await Nurse.findByIdAndDelete(req.params.id);
    if (!nurse) {
      return res.status(404).json({ error: 'Nurse not found' });
    }
    res.json({ message: 'Nurse deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


