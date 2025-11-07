import express from 'express';
import Doctor from '../models/Doctor.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Doctors
 *     description: Manage doctor profiles and assignments
 * components:
 *   schemas:
 *     Doctor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         hospital_id:
 *           type: string
 *         department_id:
 *           type: string
 *         specialization:
 *           type: string
 *         license_number:
 *           type: string
 *         consultation_fee:
 *           type: number
 *           format: float
 *         signature_data:
 *           type: string
 *           description: Base64 encoded signature
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DoctorRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - hospital_id
 *         - department_id
 *         - license_number
 *         - consultation_fee
 *       properties:
 *         user_id:
 *           type: string
 *         hospital_id:
 *           type: string
 *         department_id:
 *           type: string
 *         specialization:
 *           type: string
 *         license_number:
 *           type: string
 *         consultation_fee:
 *           type: number
 *           format: float
 *         signature_data:
 *           type: string
 */

// Get all doctors
/**
 * @openapi
 * /api/doctors:
 *   get:
 *     summary: List doctors
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of doctor profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/doctors/{id}:
 *   get:
 *     summary: Retrieve a doctor by ID
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/doctors/user/{userId}:
 *   get:
 *     summary: Retrieve a doctor profile by user ID
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID of the doctor
 *     responses:
 *       200:
 *         description: Doctor details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/doctors:
 *   post:
 *     summary: Create a doctor profile
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorRequest'
 *     responses:
 *       201:
 *         description: Doctor created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/doctors/{id}:
 *   put:
 *     summary: Update a doctor profile
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DoctorRequest'
 *     responses:
 *       200:
 *         description: Updated doctor profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Doctor'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/doctors/{id}:
 *   delete:
 *     summary: Delete a doctor profile
 *     tags:
 *       - Doctors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
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


