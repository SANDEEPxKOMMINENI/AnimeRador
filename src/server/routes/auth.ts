import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, logout } from '../controllers/auth';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be between 3-30 characters and can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/logout', auth, logout);

export default router;