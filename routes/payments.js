import express from 'express';
import Payment from '../models/Payment.js';
import Profile from '../models/Profile.js';
import Insurance from '../models/Insurance.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get payments
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


