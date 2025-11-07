import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import insuranceRoutes from './routes/insurances.js';
import hospitalRoutes from './routes/hospitals.js';
import departmentRoutes from './routes/departments.js';
import hospitalDepartmentRoutes from './routes/hospitalDepartments.js';
import doctorRoutes from './routes/doctors.js';
import nurseRoutes from './routes/nurses.js';
import pharmacyRoutes from './routes/pharmacies.js';
import medicationRoutes from './routes/medications.js';
import appointmentRoutes from './routes/appointments.js';
import consultationRoutes from './routes/consultations.js';
import labTestRoutes from './routes/labTests.js';
import prescriptionRoutes from './routes/prescriptions.js';
import pharmacyRequestRoutes from './routes/pharmacyRequests.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import vitalRoutes from './routes/vitals.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set in environment variables');
  console.error('Please create a .env file with JWT_SECRET');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set in environment variables');
  console.error('Please create a .env file with MONGODB_URI');
  process.exit(1);
}

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/insurances', insuranceRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/hospital-departments', hospitalDepartmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/nurses', nurseRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/lab-tests', labTestRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/pharmacy-requests', pharmacyRequestRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vitals', vitalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EasyHealth API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

