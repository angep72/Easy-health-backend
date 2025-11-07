import express from 'express';
import Prescription from '../models/Prescription.js';
import PrescriptionItem from '../models/PrescriptionItem.js';
import Doctor from '../models/Doctor.js';
import { authenticate } from '../middleware/auth.js';
import PharmacyRequest from '../models/PharmacyRequest.js';

const router = express.Router();

// Get prescriptions
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
    } else if (req.user.role === 'pharmacist') {
      // Pharmacists can see prescriptions for their pharmacy
      const Pharmacy = (await import('../models/Pharmacy.js')).default;
      const pharmacy = await Pharmacy.findOne({ pharmacist_id: req.user._id });
      if (pharmacy) {
        query.pharmacy_id = pharmacy._id;
      } else {
        return res.json([]);
      }
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient_id', 'full_name phone')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('pharmacy_id')
      .populate('consultation_id')
      .populate('medication_id') // Each prescription now has one medication
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get prescription by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient_id', 'full_name phone')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('pharmacy_id')
      .populate('consultation_id')
      .populate('medication_id'); // Each prescription now has one medication

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    console.log(`Prescription ${prescription._id}: Medication ${prescription.medication_id?._id || 'N/A'}`);

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create prescription
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can create prescriptions' });
    }

    const { items, ...prescriptionData } = req.body;
    
    // Validate items - prescription must have at least one item
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Prescription must contain at least one medication item' });
    }

    // Validate each item has required fields
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.medication_id) {
        return res.status(400).json({ error: `Item ${i + 1}: medication_id is required` });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: `Item ${i + 1}: quantity must be greater than 0` });
      }
      if (!item.dosage || !item.dosage.trim()) {
        return res.status(400).json({ error: `Item ${i + 1}: dosage is required` });
      }
    }

    const doctor = await Doctor.findOne({ user_id: req.user._id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    // Create one prescription per medication item
    const createdPrescriptions = [];
    
    for (const item of items) {
      const prescription = new Prescription({
        consultation_id: prescriptionData.consultation_id,
        patient_id: prescriptionData.patient_id,
        doctor_id: doctor._id,
        medication_id: item.medication_id,
        quantity: item.quantity,
        dosage: item.dosage,
        instructions: item.instructions || '',
        unit_price: item.unit_price || 0,
        total_price: (item.unit_price || 0) * item.quantity,
        notes: prescriptionData.notes || '',
        signature_data: prescriptionData.signature_data || '',
        status: prescriptionData.status || 'pending',
      });

      await prescription.save();
      
      await prescription.populate('patient_id', 'full_name phone');
      await prescription.populate('doctor_id');
      await prescription.populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      });
      await prescription.populate('pharmacy_id');
      await prescription.populate('consultation_id');
      await prescription.populate('medication_id');
      
      createdPrescriptions.push(prescription);
      
      console.log(`✅ Created prescription ${prescription._id} for medication: ${item.medication_id}`);
    }

    console.log(`✅ Created ${createdPrescriptions.length} separate prescriptions (one per medication)`);

    // Return all created prescriptions
    res.status(201).json({
      prescriptions: createdPrescriptions,
      count: createdPrescriptions.length,
      message: `Created ${createdPrescriptions.length} prescription(s) - one per medication`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update prescription
router.put('/:id', authenticate, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user_id: req.user._id });
      if (!doctor || doctor._id.toString() !== prescription.doctor_id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Extract medication fields if provided
    const { medication_id, quantity, dosage, instructions, unit_price, ...prescriptionData } = req.body;
    
    // Add medication fields back to prescriptionData if they're being updated
    if (medication_id !== undefined) prescriptionData.medication_id = medication_id;
    if (quantity !== undefined) prescriptionData.quantity = quantity;
    if (dosage !== undefined) prescriptionData.dosage = dosage;
    if (instructions !== undefined) prescriptionData.instructions = instructions;
    if (unit_price !== undefined) prescriptionData.unit_price = unit_price;

    // If medication fields are being updated, recalculate total_price
    // Use existing prescription (already fetched above) for calculations
    if (unit_price !== undefined && quantity !== undefined) {
      prescriptionData.total_price = unit_price * quantity;
    } else if (unit_price !== undefined) {
      // If only unit_price is updated, use existing quantity
      prescriptionData.total_price = unit_price * (prescription.quantity || 1);
    } else if (quantity !== undefined) {
      // If only quantity is updated, use existing unit_price
      prescriptionData.total_price = (prescription.unit_price || 0) * quantity;
    }

    console.log(`Updating prescription ${req.params.id}:`, {
      updateFields: Object.keys(prescriptionData)
    });

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      prescriptionData,
      { new: true, runValidators: true }
    )
      .populate('patient_id', 'full_name phone')
      .populate('doctor_id')
      .populate({
        path: 'doctor_id',
        populate: { path: 'user_id', select: 'full_name' }
      })
      .populate('pharmacy_id')
      .populate('consultation_id')
      .populate('medication_id'); // Each prescription now has one medication

    console.log(`Prescription ${updatedPrescription._id} updated: Medication ${updatedPrescription.medication_id?._id || 'N/A'}`);

    // If a pharmacy is assigned in this update, ensure a pharmacy request exists
    if (prescriptionData && prescriptionData.pharmacy_id) {
      // Verify prescription has medication before allowing pharmacy assignment
      if (!updatedPrescription.medication_id) {
        console.error(`❌ ERROR: Cannot assign pharmacy to prescription ${updatedPrescription._id} - prescription has no medication!`);
        return res.status(400).json({ 
          error: 'Cannot assign pharmacy: Prescription must have a medication. Please contact the doctor to fix this prescription.' 
        });
      }

      const existingRequest = await PharmacyRequest.findOne({
        prescription_id: updatedPrescription._id,
        pharmacy_id: prescriptionData.pharmacy_id,
      });
      if (!existingRequest) {
        const request = new PharmacyRequest({
          prescription_id: updatedPrescription._id,
          pharmacy_id: prescriptionData.pharmacy_id,
          patient_id: updatedPrescription.patient_id,
        });
        await request.save();
        const medicationName = updatedPrescription.medication_id?.name || updatedPrescription.medication_id?._id || 'Unknown';
        console.log(`✅ Created pharmacy request ${request._id} for prescription ${updatedPrescription._id} (medication: ${medicationName})`);
      }
    }

    res.json(updatedPrescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

