import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('businessName').notEmpty().trim(),
  body('businessEmail').isEmail().normalizeEmail(),
  body('businessPhone').notEmpty().trim(),
  body('businessAddress.street').notEmpty(),
  body('businessAddress.city').notEmpty(),
  body('businessAddress.state').notEmpty(),
  body('businessAddress.zipCode').notEmpty(),
  body('businessAddress.country').notEmpty()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getProfile);

export default router;