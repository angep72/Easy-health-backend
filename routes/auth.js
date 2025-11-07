import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Profile from '../models/Profile.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and session management
 * components:
 *   schemas:
 *     AuthRegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - full_name
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         full_name:
 *           type: string
 *         role:
 *           type: string
 *           description: User role (e.g., admin, doctor, nurse, patient)
 *         phone:
 *           type: string
 *         national_id:
 *           type: string
 *         insurance_id:
 *           type: string
 *           description: Insurance policy identifier
 *     AuthLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/Profile'
 *         token:
 *           type: string
 *           description: JWT access token
 */

// Register
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: User already exists or invalid payload
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role, phone, national_id, insurance_id } = req.body;

    // Check if user exists
    const existingUser = await Profile.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new Profile({
      email,
      password: hashedPassword,
      full_name,
      role,
      phone,
      national_id,
      insurance_id,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      user: userObj,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user and return a token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt - Body:', JSON.stringify(req.body));
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const user = await Profile.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);

    // Generate token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      user: userObj,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get current user
/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const userObj = req.user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

