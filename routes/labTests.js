import express from 'express';
import LabTestTemplate from '../models/LabTestTemplate.js';
import LabTestRequest from '../models/LabTestRequest.js';
import LabTestResult from '../models/LabTestResult.js';
import Consultation from '../models/Consultation.js';
import Appointment from '../models/Appointment.js';
import Hospital from '../models/Hospital.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: LabTests
 *     description: Manage lab test templates, requests, and results
 * components:
 *   schemas:
 *     LabTestTemplate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         category:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LabTestTemplateRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         category:
 *           type: string
 *     LabTestRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         consultation_id:
 *           type: string
 *         patient_id:
 *           type: string
 *         doctor_id:
 *           type: string
 *         lab_test_template_id:
 *           type: string
 *         hospital_id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [awaiting_payment, pending, in_progress, completed]
 *         total_price:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LabTestRequestPayload:
 *       type: object
 *       required:
 *         - consultation_id
 *         - patient_id
 *         - doctor_id
 *         - lab_test_template_id
 *         - total_price
 *       properties:
 *         consultation_id:
 *           type: string
 *         patient_id:
 *           type: string
 *         doctor_id:
 *           type: string
 *         lab_test_template_id:
 *           type: string
 *         hospital_id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [awaiting_payment, pending, in_progress, completed]
 *         total_price:
 *           type: number
 *           format: float
 *     LabTestResult:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         lab_test_request_id:
 *           type: string
 *         technician_id:
 *           type: string
 *         result_status:
 *           type: string
 *           enum: [positive, negative, inconclusive]
 *         result_data:
 *           type: string
 *         notes:
 *           type: string
 *         completed_at:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LabTestResultPayload:
 *       type: object
 *       required:
 *         - lab_test_request_id
 *         - result_status
 *         - result_data
 *       properties:
 *         lab_test_request_id:
 *           type: string
 *         result_status:
 *           type: string
 *           enum: [positive, negative, inconclusive]
 *         result_data:
 *           type: string
 *         notes:
 *           type: string
 */

// Lab Test Templates
/**
 * @openapi
 * /api/lab-tests/templates:
 *   get:
 *     summary: List lab test templates
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of lab test templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabTestTemplate'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/templates', authenticate, async (req, res) => {
  try {
    const templates = await LabTestTemplate.find().sort({ name: 1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/templates/{id}:
 *   get:
 *     summary: Retrieve a lab test template
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Lab test template details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestTemplate'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
router.get('/templates/:id', authenticate, async (req, res) => {
  try {
    const template = await LabTestTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/templates:
 *   post:
 *     summary: Create a lab test template
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTestTemplateRequest'
 *     responses:
 *       201:
 *         description: Lab test template created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestTemplate'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post('/templates', authenticate, authorize('admin'), async (req, res) => {
  try {
    const template = new LabTestTemplate(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/templates/{id}:
 *   put:
 *     summary: Update a lab test template
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTestTemplateRequest'
 *     responses:
 *       200:
 *         description: Updated lab test template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestTemplate'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
router.put('/templates/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const template = await LabTestTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/templates/{id}:
 *   delete:
 *     summary: Delete a lab test template
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted confirmation
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
router.delete('/templates/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const template = await LabTestTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lab Test Requests
/**
 * @openapi
 * /api/lab-tests/requests:
 *   get:
 *     summary: List lab test requests
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: hospitalId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter requests by hospital
 *     responses:
 *       200:
 *         description: Array of lab test requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabTestRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/requests', authenticate, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'patient') {
      query.patient_id = req.user._id;
    } else if (req.user.role === 'lab_technician') {
      // Lab technicians see only requests for hospitals they are assigned to
      const hospitals = await Hospital.find({ lab_user_id: req.user._id }).select('_id');
      const hospitalIds = hospitals.map(h => h._id);
      // If no assigned hospital, return empty
      if (hospitalIds.length === 0) {
        return res.json([]);
      }
      query.hospital_id = { $in: hospitalIds };
    } else if (req.user.role === 'doctor') {
      // Doctors can see their requests
      const Doctor = (await import('../models/Doctor.js')).default;
      const doctor = await Doctor.findOne({ user_id: req.user._id });
      if (doctor) {
        query.doctor_id = doctor._id;
      }
    }

    // Optional hospital filter via query param
    if (req.query.hospitalId) {
      query.hospital_id = req.query.hospitalId;
    }

    const requests = await LabTestRequest.find(query)
      .populate('patient_id', 'full_name')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('lab_test_template_id')
      .populate('hospital_id')
      .populate('consultation_id')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/requests/{id}:
 *   get:
 *     summary: Retrieve a lab test request
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab test request ID
 *     responses:
 *       200:
 *         description: Lab test request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.get('/requests/:id', authenticate, async (req, res) => {
  try {
    const request = await LabTestRequest.findById(req.params.id)
      .populate('patient_id', 'full_name')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('lab_test_template_id')
      .populate('consultation_id');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/requests:
 *   post:
 *     summary: Create a lab test request
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTestRequestPayload'
 *     responses:
 *       201:
 *         description: Lab test request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/requests', authenticate, async (req, res) => {
  try {
    // If hospital_id is not provided, derive it from consultation -> appointment
    let body = { ...req.body };
    if (!body.hospital_id && body.consultation_id) {
      const consultation = await Consultation.findById(body.consultation_id).populate('appointment_id');
      if (consultation && consultation.appointment_id) {
        body.hospital_id = consultation.appointment_id.hospital_id;
      } else if (body.appointment_id) {
        const appt = await Appointment.findById(body.appointment_id);
        if (appt) body.hospital_id = appt.hospital_id;
      }
    }

    const request = new LabTestRequest(body);
    await request.save();
    await request.populate('patient_id', 'full_name');
    await request.populate('doctor_id');
    await request.populate({
      path: 'doctor_id',
      populate: { path: 'user_id', select: 'full_name' }
    });
    await request.populate('lab_test_template_id');
    await request.populate('hospital_id');
    await request.populate('consultation_id');
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/requests/{id}:
 *   put:
 *     summary: Update a lab test request
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab test request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTestRequestPayload'
 *     responses:
 *       200:
 *         description: Updated lab test request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.put('/requests/:id', authenticate, async (req, res) => {
  try {
    const request = await LabTestRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patient_id', 'full_name')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('lab_test_template_id')
      .populate('consultation_id');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lab Test Results
/**
 * @openapi
 * /api/lab-tests/results:
 *   get:
 *     summary: List lab test results
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of lab test results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LabTestResult'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/results', authenticate, async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'patient') {
      const requests = await LabTestRequest.find({ patient_id: req.user._id }).select('_id');
      query.lab_test_request_id = { $in: requests.map(r => r._id) };
    } else if (req.user.role === 'doctor') {
      const Doctor = (await import('../models/Doctor.js')).default;
      const doctor = await Doctor.findOne({ user_id: req.user._id });
      if (doctor) {
        const requests = await LabTestRequest.find({ doctor_id: doctor._id }).select('_id');
        query.lab_test_request_id = { $in: requests.map(r => r._id) };
      }
    }

    const results = await LabTestResult.find(query)
      .populate('lab_test_request_id')
      .populate({
        path: 'lab_test_request_id',
        populate: [
          { path: 'patient_id', select: 'full_name' },
          { path: 'lab_test_template_id' },
          { path: 'consultation_id' }
        ]
      })
      .populate('technician_id', 'full_name')
      .sort({ completed_at: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/results/{id}:
 *   get:
 *     summary: Retrieve a lab test result
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab test result ID
 *     responses:
 *       200:
 *         description: Lab test result details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestResult'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Result not found
 *       500:
 *         description: Server error
 */
router.get('/results/:id', authenticate, async (req, res) => {
  try {
    const result = await LabTestResult.findById(req.params.id)
      .populate('lab_test_request_id')
      .populate({
        path: 'lab_test_request_id',
        populate: [
          { path: 'patient_id', select: 'full_name' },
          { path: 'lab_test_template_id' },
          { path: 'consultation_id' }
        ]
      })
      .populate('technician_id', 'full_name');

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lab-tests/results:
 *   post:
 *     summary: Record lab test results
 *     tags:
 *       - LabTests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LabTestResultPayload'
 *     responses:
 *       201:
 *         description: Lab test result created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LabTestResult'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post('/results', authenticate, authorize('lab_technician'), async (req, res) => {
  try {
    const result = new LabTestResult({
      ...req.body,
      technician_id: req.user._id,
    });
    await result.save();
    await result.populate('lab_test_request_id');
    await result.populate({
      path: 'lab_test_request_id',
      populate: [
        { path: 'patient_id', select: 'full_name' },
        { path: 'lab_test_template_id' },
        { path: 'consultation_id' }
      ]
    });
    await result.populate('technician_id', 'full_name');

    // Update request status
    await LabTestRequest.findByIdAndUpdate(result.lab_test_request_id._id, {
      status: 'completed',
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

