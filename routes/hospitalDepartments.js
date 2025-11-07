import express from 'express';
import HospitalDepartment from '../models/HospitalDepartment.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: HospitalDepartments
 *     description: Manage department assignments within hospitals
 * components:
 *   schemas:
 *     HospitalDepartment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         hospital_id:
 *           type: string
 *         department_id:
 *           type: string
 *         consultation_fee:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     HospitalDepartmentRequest:
 *       type: object
 *       required:
 *         - hospital_id
 *         - department_id
 *         - consultation_fee
 *       properties:
 *         hospital_id:
 *           type: string
 *         department_id:
 *           type: string
 *         consultation_fee:
 *           type: number
 *           format: float
 */

// Get all hospital departments
/**
 * @openapi
 * /api/hospital-departments:
 *   get:
 *     summary: List hospital department assignments
 *     tags:
 *       - HospitalDepartments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hospital_id
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by hospital ID
 *       - name: department_id
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: Array of hospital department records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HospitalDepartment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const query = {};
    if (req.query.hospital_id) {
      query.hospital_id = req.query.hospital_id;
    }
    if (req.query.department_id) {
      query.department_id = req.query.department_id;
    }

    const hospitalDepartments = await HospitalDepartment.find(query)
      .populate('hospital_id')
      .populate('department_id')
      .sort({ createdAt: -1 });
    res.json(hospitalDepartments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hospital departments by hospital ID
/**
 * @openapi
 * /api/hospital-departments/hospital/{hospitalId}:
 *   get:
 *     summary: List departments for a specific hospital
 *     tags:
 *       - HospitalDepartments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hospitalId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Array of hospital department assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HospitalDepartment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/hospital/:hospitalId', authenticate, async (req, res) => {
  try {
    const hospitalDepartments = await HospitalDepartment.find({
      hospital_id: req.params.hospitalId,
    })
      .populate('department_id')
      .sort({ createdAt: -1 });
    res.json(hospitalDepartments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hospital department (admin only)
/**
 * @openapi
 * /api/hospital-departments:
 *   post:
 *     summary: Assign a department to a hospital
 *     tags:
 *       - HospitalDepartments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HospitalDepartmentRequest'
 *     responses:
 *       201:
 *         description: Hospital department assignment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HospitalDepartment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospitalDepartment = new HospitalDepartment(req.body);
    await hospitalDepartment.save();
    await hospitalDepartment.populate('hospital_id');
    await hospitalDepartment.populate('department_id');
    res.status(201).json(hospitalDepartment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update hospital department (admin only)
/**
 * @openapi
 * /api/hospital-departments/{id}:
 *   put:
 *     summary: Update a hospital department assignment
 *     tags:
 *       - HospitalDepartments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital department record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HospitalDepartmentRequest'
 *     responses:
 *       200:
 *         description: Updated hospital department record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HospitalDepartment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Hospital department not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospitalDepartment = await HospitalDepartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('hospital_id')
      .populate('department_id');
    if (!hospitalDepartment) {
      return res.status(404).json({ error: 'Hospital department not found' });
    }
    res.json(hospitalDepartment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hospital department (admin only)
/**
 * @openapi
 * /api/hospital-departments/{id}:
 *   delete:
 *     summary: Remove a hospital department assignment
 *     tags:
 *       - HospitalDepartments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital department record ID
 *     responses:
 *       200:
 *         description: Hospital department deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Hospital department not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hospitalDepartment = await HospitalDepartment.findByIdAndDelete(req.params.id);
    if (!hospitalDepartment) {
      return res.status(404).json({ error: 'Hospital department not found' });
    }
    res.json({ message: 'Hospital department deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


