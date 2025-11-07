import express from 'express';
import PharmacyRequest from '../models/PharmacyRequest.js';
import Pharmacy from '../models/Pharmacy.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: PharmacyRequests
 *     description: Manage requests for pharmacy fulfillment
 * components:
 *   schemas:
 *     PharmacyRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         prescription_id:
 *           type: string
 *         patient_id:
 *           type: string
 *         pharmacy_id:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, completed]
 *         rejection_reason:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PharmacyRequestCreate:
 *       type: object
 *       required:
 *         - prescription_id
 *         - pharmacy_id
 *       properties:
 *         prescription_id:
 *           type: string
 *         pharmacy_id:
 *           type: string
 *     PharmacyRequestUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, completed]
 *         rejection_reason:
 *           type: string
 */

// Get pharmacy requests
/**
 * @openapi
 * /api/pharmacy-requests:
 *   get:
 *     summary: List pharmacy requests for authenticated user
 *     tags:
 *       - PharmacyRequests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of pharmacy requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PharmacyRequest'
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
    } else if (req.user.role === 'pharmacist') {
      const pharmacy = await Pharmacy.findOne({ pharmacist_id: req.user._id });
      if (pharmacy) {
        query.pharmacy_id = pharmacy._id;
      } else {
        return res.json([]);
      }
    }

    const requests = await PharmacyRequest.find(query)
      .populate('prescription_id')
      .populate({
        path: 'prescription_id',
        populate: [
          { path: 'patient_id', select: 'full_name phone' },
          { path: 'doctor_id' },
          {
            path: 'doctor_id',
            populate: { path: 'user_id', select: 'full_name' }
          },
          { path: 'medication_id' } // Each prescription now has one medication directly
        ]
      })
      .populate('pharmacy_id')
      .populate('patient_id', 'full_name phone')
      .sort({ createdAt: -1 });

    // Log prescription details - each prescription now represents one medication
    for (const request of requests) {
      if (request.prescription_id && request.prescription_id._id) {
        const prescriptionId = request.prescription_id._id;
        const pres = request.prescription_id;
        
        // Ensure prescription is plain object
        if (pres && typeof pres.toObject === 'function') {
          request.prescription_id = pres.toObject();
        }
        
        // Create items array with single item (for backward compatibility with frontend)
        // Each prescription now IS one item, so we wrap it in an items array
        const medicationItem = {
          _id: pres._id,
          medication_id: pres.medication_id,
          quantity: pres.quantity,
          dosage: pres.dosage,
          instructions: pres.instructions,
          unit_price: pres.unit_price || 0,
          total_price: pres.total_price || 0,
        };
        request.prescription_id.items = [medicationItem];
        
        // Log full prescription details being sent to pharmacy
        console.log('\n📋 ===== PRESCRIPTION SENT TO PHARMACY =====');
        console.log(`Pharmacy Request ID: ${request._id}`);
        console.log(`Prescription ID: ${prescriptionId.toString()}`);
        console.log(`Patient: ${pres?.patient_id?.full_name || 'Unknown'}`);
        console.log(`Status: ${pres?.status || 'Unknown'}`);
        console.log(`Total Price: ${pres?.total_price || 0} RWF`);
        console.log(`Notes: ${pres?.notes || 'None'}`);
        console.log(`\n💊 PRESCRIPTION MEDICATION (1 medication per prescription):`);
        console.log(`  - Prescription ID: ${pres._id}`);
        console.log(`  - Medication: ${pres.medication_id?.name || pres.medication_id?._id || 'Unknown'}`);
        console.log(`  - Medication ID: ${pres.medication_id?._id || 'N/A'}`);
        console.log(`  - Quantity: ${pres.quantity || 0}`);
        console.log(`  - Dosage: ${pres.dosage || 'N/A'}`);
        console.log(`  - Instructions: ${pres.instructions || 'None'}`);
        console.log(`  - Unit Price: ${pres.unit_price || 0} RWF`);
        console.log(`  - Total Price: ${pres.total_price || 0} RWF`);
        if (pres.medication_id && typeof pres.medication_id === 'object' && pres.medication_id.stock_quantity !== undefined) {
          console.log(`  - Stock Quantity: ${pres.medication_id.stock_quantity}`);
        }
        console.log('📋 ===== END PRESCRIPTION DETAILS =====\n');
        
        // Validate prescription has medication
        if (!pres.medication_id) {
          request.isInvalid = true;
          request.invalidReason = 'Prescription has no medication';
          console.log(`⚠️ Warning: Prescription ${prescriptionId.toString()} has no medication!`);
        } else {
          request.isInvalid = false;
        }
      } else {
        console.log(`Warning: Pharmacy request ${request._id} has no prescription_id`);
        if (request.prescription_id) {
          request.prescription_id.items = [];
        }
      }
    }

    // Log summary of all requests being sent
    console.log('\n📊 ===== PHARMACY REQUESTS SUMMARY =====');
    console.log(`Total Requests: ${requests.length}`);
    requests.forEach((req, index) => {
      const pres = req.prescription_id;
      const hasMedication = pres?.medication_id ? 1 : 0;
      console.log(`  Request ${index + 1}: ID=${req._id}, Prescription=${pres?._id || 'N/A'}, Medication=${hasMedication}, Status=${pres?.status || 'N/A'}`);
    });
    console.log('📊 ===== END SUMMARY =====\n');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pharmacy request by ID
/**
 * @openapi
 * /api/pharmacy-requests/{id}:
 *   get:
 *     summary: Retrieve a pharmacy request
 *     tags:
 *       - PharmacyRequests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy request ID
 *     responses:
 *       200:
 *         description: Pharmacy request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PharmacyRequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await PharmacyRequest.findById(req.params.id)
      .populate('prescription_id')
      .populate({
        path: 'prescription_id',
        populate: [
          { path: 'patient_id', select: 'full_name phone' },
          { path: 'doctor_id' },
          {
            path: 'doctor_id',
            populate: { path: 'user_id', select: 'full_name' }
          }
        ]
      })
      .populate('pharmacy_id')
      .populate('patient_id', 'full_name phone');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const PrescriptionItem = (await import('../models/PrescriptionItem.js')).default;
    const items = await PrescriptionItem.find({ prescription_id: request.prescription_id._id })
      .populate('medication_id');
    request.prescription_id.items = items;

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create pharmacy request
/**
 * @openapi
 * /api/pharmacy-requests:
 *   post:
 *     summary: Create a pharmacy request
 *     tags:
 *       - PharmacyRequests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PharmacyRequestCreate'
 *     responses:
 *       201:
 *         description: Pharmacy request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PharmacyRequest'
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
      return res.status(403).json({ error: 'Only patients can create pharmacy requests' });
    }

    const request = new PharmacyRequest({
      ...req.body,
      patient_id: req.user._id,
    });
    await request.save();
    await request.populate('prescription_id');
    await request.populate({
      path: 'prescription_id',
      populate: [
        { path: 'patient_id', select: 'full_name phone' },
        { path: 'doctor_id' },
        {
          path: 'doctor_id',
          populate: { path: 'user_id', select: 'full_name' }
        }
      ]
    });
    await request.populate('pharmacy_id');
    await request.populate('patient_id', 'full_name phone');

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pharmacy request
/**
 * @openapi
 * /api/pharmacy-requests/{id}:
 *   put:
 *     summary: Update a pharmacy request
 *     tags:
 *       - PharmacyRequests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Pharmacy request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PharmacyRequestUpdate'
 *     responses:
 *       200:
 *         description: Updated pharmacy request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PharmacyRequest'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const request = await PharmacyRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (req.user.role === 'patient' && request.patient_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'pharmacist') {
      const pharmacy = await Pharmacy.findOne({ pharmacist_id: req.user._id });
      if (!pharmacy || pharmacy._id.toString() !== request.pharmacy_id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const updatedRequest = await PharmacyRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('prescription_id')
      .populate({
        path: 'prescription_id',
        populate: [
          { path: 'patient_id', select: 'full_name phone' },
          { path: 'doctor_id' },
          {
            path: 'doctor_id',
            populate: { path: 'user_id', select: 'full_name' }
          }
        ]
      })
      .populate('pharmacy_id')
      .populate('patient_id', 'full_name phone');

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

