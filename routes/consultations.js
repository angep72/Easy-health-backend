import express from 'express';
import Consultation from '../models/Consultation.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get consultations
router.get('/', authenticate, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'patient') {
      query.patient_id = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user_id: req.user._id });
      if (doctor) {
        query.doctor_id = doctor._id;
      } else {
        return res.json([]);
      }
    }

    const consultations = await Consultation.find(query)
      .populate('patient_id', 'full_name phone national_id')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('appointment_id')
      .sort({ consultation_date: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get consultation by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patient_id', 'full_name phone national_id')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('appointment_id');

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get consultation by appointment ID
router.get('/appointment/:appointmentId', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findOne({ appointment_id: req.params.appointmentId })
      .populate('patient_id', 'full_name phone national_id')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('appointment_id');

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create consultation
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create consultations' });
    }

    const appointment = await Appointment.findById(req.body.appointment_id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor || doctor._id.toString() !== appointment.doctor_id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const consultation = new Consultation({
      ...req.body,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
    });
    await consultation.save();
    await consultation.populate('patient_id', 'full_name phone national_id');
    await consultation.populate('doctor_id');
    await consultation.populate({
      path: 'doctor_id',
      populate: { path: 'user_id', select: 'full_name' }
    });
    await consultation.populate('appointment_id');

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update consultation
router.put('/:id', authenticate, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user_id: req.user._id });
      if (!doctor || doctor._id.toString() !== consultation.doctor_id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const updatedConsultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('patient_id', 'full_name phone national_id')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('appointment_id');

    res.json(updatedConsultation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


