import express from 'express';
import Medication from '../models/Medication.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Medications
 *     description: Manage medication catalog
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         unit_price:
 *           type: number
 *           format: float
 *         stock_quantity:
 *           type: number
 *         requires_prescription:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     MedicationRequest:
 *       type: object
 *       required:
 *         - name
 *         - unit_price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         unit_price:
 *           type: number
 *           format: float
 *         stock_quantity:
 *           type: number
 *         requires_prescription:
 *           type: boolean
 */

// Get all medications
/**
 * @openapi
 * /api/medications:
 *   get:
 *     summary: List medications
 *     tags:
 *       - Medications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Case-insensitive search by medication name
 *     responses:
 *       200:
 *         description: Array of medications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/medications/{id}:
 *   get:
 *     summary: Retrieve a medication by ID
 *     tags:
 *       - Medications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Medication not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/medications:
 *   post:
 *     summary: Create a medication
 *     tags:
 *       - Medications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationRequest'
 *     responses:
 *       201:
 *         description: Medication created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/medications/{id}:
 *   put:
 *     summary: Update a medication
 *     tags:
 *       - Medications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationRequest'
 *     responses:
 *       200:
 *         description: Updated medication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Medication not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/medications/{id}:
 *   delete:
 *     summary: Delete a medication
 *     tags:
 *       - Medications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Medication ID
 *     responses:
 *       200:
 *         description: Medication deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Medication not found
 *       500:
 *         description: Server error
 */
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

