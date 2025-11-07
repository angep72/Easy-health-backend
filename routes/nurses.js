import express from 'express';
import Nurse from '../models/Nurse.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Nurses
 *     description: Manage nurse profiles
 * components:
 *   schemas:
 *     Nurse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         license_number:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NurseRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - license_number
 *       properties:
 *         user_id:
 *           type: string
 *         license_number:
 *           type: string
 */

// Get all nurses
/**
 * @openapi
 * /api/nurses:
 *   get:
 *     summary: List nurses
 *     tags:
 *       - Nurses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of nurse profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nurse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/nurses/{id}:
 *   get:
 *     summary: Retrieve a nurse by ID
 *     tags:
 *       - Nurses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Nurse ID
 *     responses:
 *       200:
 *         description: Nurse details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nurse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Nurse not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/nurses/user/{userId}:
 *   get:
 *     summary: Retrieve a nurse by user ID
 *     tags:
 *       - Nurses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID of the nurse
 *     responses:
 *       200:
 *         description: Nurse details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nurse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Nurse not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/nurses:
 *   post:
 *     summary: Create a nurse profile
 *     tags:
 *       - Nurses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NurseRequest'
 *     responses:
 *       201:
 *         description: Nurse created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nurse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/nurses/{id}:
 *   put:
 *     summary: Update a nurse profile
 *     tags:
 *       - Nurses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Nurse ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NurseRequest'
 *     responses:
 *       200:
 *         description: Updated nurse profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nurse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Nurse not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/nurses/{id}:
 *   delete:
 *     summary: Delete a nurse profile
 *     tags:
 *       - Nurses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Nurse ID
 *     responses:
 *       200:
 *         description: Nurse deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Nurse not found
 *       500:
 *         description: Server error
 */
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


