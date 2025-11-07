import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Notifications
 *     description: Manage user notifications
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *         reference_id:
 *           type: string
 *           nullable: true
 *         is_read:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     NotificationCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - type
 *       properties:
 *         user_id:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *         reference_id:
 *           type: string
 */

// Get notifications
/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: List notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread notifications count
/**
 * @openapi
 * /api/notifications/unread/count:
 *   get:
 *     summary: Get count of unread notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user_id: req.user._id,
      is_read: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
/**
 * @openapi
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Updated notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notification.is_read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
/**
 * @openapi
 * /api/notifications/read/all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Confirmation message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/read/all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { is_read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification
/**
 * @openapi
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationCreateRequest'
 *     responses:
 *       201:
 *         description: Notification created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      user_id: req.body.user_id || req.user._id,
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

