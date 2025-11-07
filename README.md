# EasyHealth Backend API

MongoDB + Express + Node.js backend for the EasyHealth healthcare management platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI= your mongo URI
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB connection string.

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles` - Get all profiles (admin only)
- `GET /api/profiles/:id` - Get profile by ID
- `PUT /api/profiles/:id` - Update profile

### Insurances
- `GET /api/insurances` - Get all insurances
- `GET /api/insurances/:id` - Get insurance by ID
- `POST /api/insurances` - Create insurance (admin only)
- `PUT /api/insurances/:id` - Update insurance (admin only)
- `DELETE /api/insurances/:id` - Delete insurance (admin only)

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID
- `POST /api/hospitals` - Create hospital (admin only)
- `PUT /api/hospitals/:id` - Update hospital (admin only)
- `DELETE /api/hospitals/:id` - Delete hospital (admin only)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department (admin only)
- `PUT /api/departments/:id` - Update department (admin only)
- `DELETE /api/departments/:id` - Delete department (admin only)

### Hospital Departments
- `GET /api/hospital-departments` - Get all hospital departments
- `GET /api/hospital-departments/hospital/:hospitalId` - Get departments for a hospital
- `POST /api/hospital-departments` - Create hospital department (admin only)
- `PUT /api/hospital-departments/:id` - Update hospital department (admin only)
- `DELETE /api/hospital-departments/:id` - Delete hospital department (admin only)

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/user/:userId` - Get doctor by user ID
- `POST /api/doctors` - Create doctor (admin only)
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor (admin only)

### Nurses
- `GET /api/nurses` - Get all nurses
- `GET /api/nurses/:id` - Get nurse by ID
- `GET /api/nurses/user/:userId` - Get nurse by user ID
- `POST /api/nurses` - Create nurse (admin only)
- `PUT /api/nurses/:id` - Update nurse
- `DELETE /api/nurses/:id` - Delete nurse (admin only)

### Pharmacies
- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacies/:id` - Get pharmacy by ID
- `GET /api/pharmacies/pharmacist/:pharmacistId` - Get pharmacy by pharmacist ID
- `POST /api/pharmacies` - Create pharmacy (admin only)
- `PUT /api/pharmacies/:id` - Update pharmacy (admin only)
- `DELETE /api/pharmacies/:id` - Delete pharmacy (admin only)

### Medications
- `GET /api/medications?search=...` - Get all medications (with optional search)
- `GET /api/medications/:id` - Get medication by ID
- `POST /api/medications` - Create medication (admin/pharmacist only)
- `PUT /api/medications/:id` - Update medication (admin/pharmacist only)
- `DELETE /api/medications/:id` - Delete medication (admin/pharmacist only)

### Appointments
- `GET /api/appointments` - Get appointments (filtered by role)
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment (patient only)
- `PUT /api/appointments/:id` - Update appointment
- `GET /api/appointments/available/:doctorId/:date` - Get available time slots

### Consultations
- `GET /api/consultations` - Get consultations (filtered by role)
- `GET /api/consultations/:id` - Get consultation by ID
- `GET /api/consultations/appointment/:appointmentId` - Get consultation by appointment ID
- `POST /api/consultations` - Create consultation (doctor only)
- `PUT /api/consultations/:id` - Update consultation

### Lab Tests
- `GET /api/lab-tests/templates` - Get all lab test templates
- `GET /api/lab-tests/templates/:id` - Get template by ID
- `POST /api/lab-tests/templates` - Create template (admin only)
- `PUT /api/lab-tests/templates/:id` - Update template (admin only)
- `DELETE /api/lab-tests/templates/:id` - Delete template (admin only)
- `GET /api/lab-tests/requests` - Get lab test requests (filtered by role)
- `GET /api/lab-tests/requests/:id` - Get request by ID
- `POST /api/lab-tests/requests` - Create lab test request
- `PUT /api/lab-tests/requests/:id` - Update lab test request
- `GET /api/lab-tests/results` - Get lab test results (filtered by role)
- `GET /api/lab-tests/results/:id` - Get result by ID
- `POST /api/lab-tests/results` - Create lab test result (lab technician only)

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions (filtered by role)
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create prescription (doctor only)
- `PUT /api/prescriptions/:id` - Update prescription

### Pharmacy Requests
- `GET /api/pharmacy-requests` - Get pharmacy requests (filtered by role)
- `GET /api/pharmacy-requests/:id` - Get request by ID
- `POST /api/pharmacy-requests` - Create pharmacy request (patient only)
- `PUT /api/pharmacy-requests/:id` - Update pharmacy request

### Payments
- `GET /api/payments` - Get payments (filtered by role)
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment (patient only)
- `GET /api/payments/reference/:type/:referenceId` - Get payment by reference

### Notifications
- `GET /api/notifications` - Get notifications for current user
- `GET /api/notifications/unread/count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read/all` - Mark all notifications as read

### Vitals
- `GET /api/vitals` - Get vitals (filtered by role)
- `GET /api/vitals/patient/:patientId` - Get vitals by patient ID
- `GET /api/vitals/:id` - Get vital by ID
- `POST /api/vitals` - Create vital (nurse only)

## Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Data Format

All IDs are MongoDB ObjectIds. The API returns data with populated references where applicable.

## Error Handling

Errors are returned in the following format:
```json
{
  "error": "Error message"
}
```

HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error


