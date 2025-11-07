import express from 'express';
import Pharmacy from '../models/Pharmacy.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Pharmacies
 *     description: Manage pharmacies and pharmacy staff
 * components:
 *   schemas:
 *     Pharmacy:
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
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *         pharmacist_id:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PharmacyRequest:
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
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *         pharmacist_id:
 *           type: string
 *           nullable: true
 */

// Get all pharmacies
/**
 * @openapi
 * /api/pharmacies:
 *   get:
 *     summary: List pharmacies
 *     tags:
 *       - Pharmacies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of pharmacies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pharmacy'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/pharmacies/{id}:
 *   get:
 *     summary: Retrieve a pharmacy by ID
 *     tags:
 *       - Pharmacies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *     responses:
 *       200:
 *         description: Pharmacy details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/pharmacies/pharmacist/{pharmacistId}:
 *   get:
 *     summary: Retrieve a pharmacy by pharmacist profile
 *     tags:
 *       - Pharmacies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pharmacistId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacist profile ID
 *     responses:
 *       200:
 *         description: Pharmacy details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/pharmacies:
 *   post:
 *     summary: Create a pharmacy
 *     tags:
 *       - Pharmacies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PharmacyRequest'
 *     responses:
 *       201:
 *         description: Pharmacy created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/pharmacies/{id}:
 *   put:
 *     summary: Update a pharmacy
 *     tags:
 *       - Pharmacies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PharmacyRequest'
 *     responses:
 *       200:
 *         description: Updated pharmacy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pharmacy'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/pharmacies/{id}:
 *   delete:
 *     summary: Delete a pharmacy
 *     tags:
 *       - Pharmacies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy ID
 *     responses:
 *       200:
 *         description: Pharmacy deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Server error
 */
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

