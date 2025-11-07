import express from 'express';
import Profile from '../models/Profile.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all profiles (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const profiles = await Profile.find().select('-password').populate('insurance_id');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).select('-password').populate('insurance_id');
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Users can view own profile, admins can view all
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Users can only update their own profile, admins can update any
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password').populate('insurance_id');

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete profile (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

