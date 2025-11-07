import express from 'express';
import Department from '../models/Department.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Departments
 *     description: Manage hospital departments and specialties
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     DepartmentRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 */

// Get all departments
/**
 * @openapi
 * /api/departments:
 *   get:
 *     summary: List departments
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get department by ID
/**
 * @openapi
 * /api/departments/{id}:
 *   get:
 *     summary: Retrieve a department by ID
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department (admin only)
/**
 * @openapi
 * /api/departments:
 *   post:
 *     summary: Create a department
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentRequest'
 *     responses:
 *       201:
 *         description: Department created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update department (admin only)
/**
 * @openapi
 * /api/departments/{id}:
 *   put:
 *     summary: Update a department
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepartmentRequest'
 *     responses:
 *       200:
 *         description: Updated department
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department (admin only)
/**
 * @openapi
 * /api/departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     tags:
 *       - Departments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


