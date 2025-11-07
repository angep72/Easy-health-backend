import express from 'express';
import Hospital from '../models/Hospital.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Hospitals
 *     description: Manage hospitals and facilities
 * components:
 *   schemas:
 *     Hospital:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         location:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         description:
 *           type: string
 *         consultation_fee:
 *           type: number
 *           format: float
 *           minimum: 0
 *         lab_user_id:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     HospitalRequest:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *         location:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         description:
 *           type: string
 *         consultation_fee:
 *           type: number
 *           format: float
 *         lab_user_id:
 *           type: string
 *           nullable: true
 */

// Get all hospitals
/**
 * @openapi
 * /api/hospitals:
 *   get:
 *     summary: List hospitals
 *     tags:
 *       - Hospitals
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of hospitals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hospital by ID
/**
 * @openapi
 * /api/hospitals/{id}:
 *   get:
 *     summary: Retrieve a hospital
 *     tags:
 *       - Hospitals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/hospitals:
 *   post:
 *     summary: Create a hospital
 *     tags:
 *       - Hospitals
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HospitalRequest'
 *     responses:
 *       201:
 *         description: Hospital created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/hospitals/{id}:
 *   put:
 *     summary: Update a hospital
 *     tags:
 *       - Hospitals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HospitalRequest'
 *     responses:
 *       200:
 *         description: Updated hospital
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/hospitals/{id}:
 *   delete:
 *     summary: Delete a hospital
 *     tags:
 *       - Hospitals
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Hospital not found
 *       500:
 *         description: Server error
 */
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


