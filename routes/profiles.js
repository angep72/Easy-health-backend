import express from 'express';
import Profile from '../models/Profile.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Profiles
 *     description: Manage user profiles
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         full_name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [patient, doctor, lab_technician, pharmacist, admin, nurse]
 *         phone:
 *           type: string
 *         national_id:
 *           type: string
 *         insurance_id:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: 64fa1f2c5b1234567890abcd
 *         email: user@example.com
 *         full_name: John Doe
 *         role: patient
 *         phone: "+250700000000"
 *         national_id: "1234567890123456"
 *         insurance_id: 64fa1f2c5b9876543210dcba
 *         createdAt: 2024-01-01T09:00:00.000Z
 *         updatedAt: 2024-01-02T11:30:00.000Z
 *     ProfileUpdateRequest:
 *       type: object
 *       properties:
 *         full_name:
 *           type: string
 *         phone:
 *           type: string
 *         national_id:
 *           type: string
 *         insurance_id:
 *           type: string
 *           nullable: true
 */

// Get all profiles (admin only)
/**
 * @openapi
 * /api/profiles:
 *   get:
 *     summary: Get all user profiles
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const profiles = await Profile.find().select('-password').populate('insurance_id');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get profile by ID
/**
 * @openapi
 * /api/profiles/{id}:
 *   get:
 *     summary: Get a profile by ID
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/profiles/{id}:
 *   put:
 *     summary: Update a profile
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
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
/**
 * @openapi
 * /api/profiles/{id}:
 *   delete:
 *     summary: Delete a profile
 *     tags:
 *       - Profiles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
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

