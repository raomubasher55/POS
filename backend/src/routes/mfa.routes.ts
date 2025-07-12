import express from 'express';
import { body } from 'express-validator';
import * as mfaController from '../controllers/mfa.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

const verifyMFAValidation = [
  body('token').notEmpty().isLength({ min: 6, max: 6 }).withMessage('MFA token must be 6 digits')
];

const disableMFAValidation = [
  body('password').notEmpty().withMessage('Password is required'),
  body('mfaToken').optional().isLength({ min: 6, max: 6 }).withMessage('MFA token must be 6 digits')
];

const generateBackupCodesValidation = [
  body('mfaToken').notEmpty().isLength({ min: 6, max: 6 }).withMessage('MFA token must be 6 digits')
];

// MFA routes
router.post('/setup', verifyToken, mfaController.setupMFA);
router.post('/verify', verifyToken, verifyMFAValidation, mfaController.verifyMFA);
router.post('/disable', verifyToken, disableMFAValidation, mfaController.disableMFA);
router.get('/status', verifyToken, mfaController.getMFAStatus);
router.post('/backup-codes', verifyToken, generateBackupCodesValidation, mfaController.generateNewBackupCodes);

export default router;