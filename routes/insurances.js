import express from 'express';
import Insurance from '../models/Insurance.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Insurances
 *     description: Manage insurance providers and coverage rules
 * components:
 *   schemas:
 *     Insurance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         coverage_percentage:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     InsuranceRequest:
 *       type: object
 *       required:
 *         - name
 *         - coverage_percentage
 *       properties:
 *         name:
 *           type: string
 *         coverage_percentage:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *         description:
 *           type: string
 */

// Get all insurances
/**
 * @openapi
 * /api/insurances:
 *   get:
 *     summary: List insurance providers
 *     tags:
 *       - Insurances
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of insurance providers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Insurance'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const insurances = await Insurance.find().sort({ name: 1 });
    res.json(insurances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get insurance by ID
/**
 * @openapi
 * /api/insurances/{id}:
 *   get:
 *     summary: Retrieve an insurance provider
 *     tags:
 *       - Insurances
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Insurance ID
 *     responses:
 *       200:
 *         description: Insurance details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insurance'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/insurances:
 *   post:
 *     summary: Create a new insurance provider
 *     tags:
 *       - Insurances
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsuranceRequest'
 *     responses:
 *       201:
 *         description: Insurance created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insurance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/insurances/{id}:
 *   put:
 *     summary: Update an insurance provider
 *     tags:
 *       - Insurances
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Insurance ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InsuranceRequest'
 *     responses:
 *       200:
 *         description: Updated insurance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Insurance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/insurances/{id}:
 *   delete:
 *     summary: Delete an insurance provider
 *     tags:
 *       - Insurances
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Insurance ID
 *     responses:
 *       200:
 *         description: Insurance deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Insurance not found
 *       500:
 *         description: Server error
 */
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


