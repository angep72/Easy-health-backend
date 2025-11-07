import express from 'express';
import HospitalDepartment from '../models/HospitalDepartment.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all hospital departments
router.get('/', authenticate, async (req, res) => {
  try {
    const query = {};
    if (req.query.hospital_id) {
      query.hospital_id = req.query.hospital_id;
    }
    if (req.query.department_id) {
      query.department_id = req.query.department_id;
    }

    const hospitalDepartments = await HospitalDepartment.find(query)
      .populate('hospital_id')
      .populate('department_id')
      .sort({ createdAt: -1 });
    res.json(hospitalDepartments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hospital departments by hospital ID
router.get('/hospital/:hospitalId', authenticate, async (req, res) => {
  try {
    const hospitalDepartments = await HospitalDepartment.find({
      hospital_id: req.params.hospitalId,
    })
      .populate('department_id')
      .sort({ createdAt: -1 });
    res.json(hospitalDepartments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hospital department (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospitalDepartment = new HospitalDepartment(req.body);
    await hospitalDepartment.save();
    await hospitalDepartment.populate('hospital_id');
    await hospitalDepartment.populate('department_id');
    res.status(201).json(hospitalDepartment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update hospital department (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospitalDepartment = await HospitalDepartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('hospital_id')
      .populate('department_id');
    if (!hospitalDepartment) {
      return res.status(404).json({ error: 'Hospital department not found' });
    }
    res.json(hospitalDepartment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hospital department (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospitalDepartment = await HospitalDepartment.findByIdAndDelete(req.params.id);
    if (!hospitalDepartment) {
      return res.status(404).json({ error: 'Hospital department not found' });
    }
    res.json({ message: 'Hospital department deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


