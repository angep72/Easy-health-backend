import express from 'express';
import Vital from '../models/Vital.js';
import Nurse from '../models/Nurse.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Vitals
 *     description: Manage patient vital signs
 * components:
 *   schemas:
 *     Vital:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         patient_id:
 *           type: string
 *         nurse_id:
 *           type: string
 *         blood_pressure:
 *           type: string
 *         heart_rate:
 *           type: number
 *         temperature:
 *           type: number
 *           format: float
 *         weight:
 *           type: number
 *           format: float
 *         height:
 *           type: number
 *           format: float
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     VitalCreateRequest:
 *       type: object
 *       required:
 *         - patient_id
 *       properties:
 *         patient_id:
 *           type: string
 *         blood_pressure:
 *           type: string
 *         heart_rate:
 *           type: number
 *         temperature:
 *           type: number
 *         weight:
 *           type: number
 *         height:
 *           type: number
 *         notes:
 *           type: string
 */

// Get vitals
/**
 * @openapi
 * /api/vitals:
 *   get:
 *     summary: List vitals for the authenticated user
 *     tags:
 *       - Vitals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of vitals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vital'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/vitals/patient/{patientId}:
 *   get:
 *     summary: List vitals for a specific patient
 *     tags:
 *       - Vitals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: patientId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Array of vitals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vital'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/vitals:
 *   post:
 *     summary: Record patient vitals
 *     tags:
 *       - Vitals
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VitalCreateRequest'
 *     responses:
 *       201:
 *         description: Vital record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vital'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/vitals/{id}:
 *   get:
 *     summary: Retrieve a vital record by ID
 *     tags:
 *       - Vitals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Vital record ID
 *     responses:
 *       200:
 *         description: Vital record details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vital'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vital not found
 *       500:
 *         description: Server error
 */
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


