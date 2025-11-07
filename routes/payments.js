import express from 'express';
import Payment from '../models/Payment.js';
import Profile from '../models/Profile.js';
import Insurance from '../models/Insurance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Payments
 *     description: Manage patient payments and coverage
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         patient_id:
 *           type: string
 *         payment_type:
 *           type: string
 *           enum: [consultation, lab_test, medication]
 *         reference_id:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 *         insurance_coverage:
 *           type: number
 *           format: float
 *         patient_pays:
 *           type: number
 *           format: float
 *         status:
 *           type: string
 *           enum: [pending, completed, failed]
 *         payment_method:
 *           type: string
 *         transaction_id:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PaymentCreateRequest:
 *       type: object
 *       required:
 *         - amount
 *         - payment_type
 *         - reference_id
 *       properties:
 *         amount:
 *           type: number
 *           format: float
 *         payment_type:
 *           type: string
 *           enum: [consultation, lab_test, medication]
 *         reference_id:
 *           type: string
 *         payment_method:
 *           type: string
 *         transaction_id:
 *           type: string
 */

// Get payments
/**
 * @openapi
 * /api/payments:
 *   get:
 *     summary: List payments for the authenticated user
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'patient') {
      query.patient_id = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all
    } else if (req.user.role === 'doctor') {
      // Doctors can see consultation payments
      query.payment_type = 'consultation';
    }

    const payments = await Payment.find(query)
      .populate('patient_id', 'full_name email')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
/**
 * @openapi
 * /api/payments/{id}:
 *   get:
 *     summary: Retrieve a payment by ID
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('patient_id', 'full_name email');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (req.user.role !== 'admin' && payment.patient_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment
/**
 * @openapi
 * /api/payments:
 *   post:
 *     summary: Create a payment record
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreateRequest'
 *     responses:
 *       201:
 *         description: Payment recorded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can create payments' });
    }

    const { amount, payment_type, reference_id, payment_method, transaction_id } = req.body;

    // Get patient insurance
    const patient = await Profile.findById(req.user._id).populate('insurance_id');
    let insuranceCoverage = 0;
    
    if (patient.insurance_id) {
      const insurance = await Insurance.findById(patient.insurance_id);
      if (insurance) {
        insuranceCoverage = (amount * insurance.coverage_percentage) / 100;
      }
    }

    const patientPays = amount - insuranceCoverage;

    const payment = new Payment({
      patient_id: req.user._id,
      payment_type,
      reference_id,
      amount,
      insurance_coverage: insuranceCoverage,
      patient_pays: patientPays,
      payment_method,
      transaction_id,
      status: 'completed',
    });

    await payment.save();
    await payment.populate('patient_id', 'full_name email');

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by reference
/**
 * @openapi
 * /api/payments/reference/{type}/{referenceId}:
 *   get:
 *     summary: Retrieve a payment by reference
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [consultation, lab_test, medication]
 *         description: Payment type
 *       - name: referenceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Reference ID matching the payment
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get('/reference/:type/:referenceId', authenticate, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      payment_type: req.params.type,
      reference_id: req.params.referenceId,
    }).populate('patient_id', 'full_name email');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (req.user.role !== 'admin' && payment.patient_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


