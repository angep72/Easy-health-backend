import express from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all appointments
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

    const appointments = await Appointment.find(query)
      .populate('patient_id', 'full_name phone national_id')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('hospital_id')
      .populate('department_id')
      .sort({ appointment_date: 1, appointment_time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointment by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient_id', 'full_name phone national_id')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('hospital_id')
      .populate('department_id');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check access
    if (req.user.role === 'patient' && appointment.patient_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create appointment
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can create appointments' });
    }

    const appointment = new Appointment({
      ...req.body,
      patient_id: req.user._id,
    });
    await appointment.save();
    await appointment.populate('patient_id', 'full_name phone national_id');
    await appointment.populate('doctor_id');
    await appointment.populate({
      path: 'doctor_id',
      populate: { path: 'user_id', select: 'full_name' }
    });
    await appointment.populate('hospital_id');
    await appointment.populate('department_id');

    // Create notification for doctor
    const doctor = await Doctor.findById(appointment.doctor_id).populate('user_id');
    if (doctor) {
      await Notification.create({
        user_id: doctor.user_id._id,
        title: 'New Appointment Request',
        message: `You have a new appointment request from ${req.user.full_name}`,
        type: 'appointment',
        reference_id: appointment._id,
      });
    }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment (approve/reject)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions based on role
    if (req.user.role === 'doctor') {
      // Doctors can approve/reject their own appointments
      const doctor = await Doctor.findOne({ user_id: req.user._id });
      if (!doctor || doctor._id.toString() !== appointment.doctor_id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role === 'nurse') {
      // Nurses can update appointments to record vitals and approve/reject
      // They can work with any appointment in the system
      // No additional permission check needed
    } else if (req.user.role === 'admin') {
      // Admins can update any appointment
      // No additional permission check needed
    } else if (req.user._id.toString() !== appointment.patient_id.toString()) {
      // Patients can only update their own appointments
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
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
      .populate('hospital_id')
      .populate('department_id');

    // Create notification for patient
    if (req.body.status === 'approved' || req.body.status === 'rejected') {
      await Notification.create({
        user_id: appointment.patient_id,
        title: `Appointment ${req.body.status}`,
        message: `Your appointment has been ${req.body.status}`,
        type: 'appointment',
        reference_id: appointment._id,
      });
    }

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available time slots
router.get('/available/:doctorId/:date', authenticate, async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const appointments = await Appointment.find({
      doctor_id: doctorId,
      appointment_date: new Date(date),
      status: { $in: ['pending', 'approved'] },
    }).select('appointment_time');

    const bookedSlots = appointments.map(a => a.appointment_time);
    
    // Generate all possible slots (8 AM to 6 PM, 10-minute intervals)
    const allSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 10) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        allSlots.push(timeStr);
      }
    }

    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

