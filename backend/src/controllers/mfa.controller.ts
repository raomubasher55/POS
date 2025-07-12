import { Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../types';

export const setupMFA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.mfaEnabled) {
      res.status(400).json({ message: 'MFA is already enabled for this account' });
      return;
    }

    const secret = speakeasy.generateSecret({
      name: `POS System (${req.user.email})`,
      issuer: 'POS System',
      length: 32,
    });

    // Store the secret temporarily (in real implementation, you might want to encrypt this)
    await User.findByIdAndUpdate(req.user._id, {
      mfaSecret: secret.base32,
      mfaEnabled: false // Not enabled until verified
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    res.json({
      message: 'MFA setup initiated',
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: generateBackupCodes() // Generate backup codes
    });

  } catch (error) {
    console.error('Setup MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyMFA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'MFA token is required' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.mfaSecret) {
      res.status(400).json({ message: 'MFA not set up for this account' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps before/after current time
    });

    if (!verified) {
      res.status(400).json({ message: 'Invalid MFA token' });
      return;
    }

    // Enable MFA for the user
    await User.findByIdAndUpdate(req.user._id, {
      mfaEnabled: true
    });

    res.json({
      message: 'MFA successfully enabled',
      mfaEnabled: true
    });

  } catch (error) {
    console.error('Verify MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const disableMFA = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { password, mfaToken } = req.body;

    if (!password) {
      res.status(400).json({ message: 'Password is required to disable MFA' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Invalid password' });
      return;
    }

    // If MFA is enabled, require MFA token to disable
    if (user.mfaEnabled && user.mfaSecret) {
      if (!mfaToken) {
        res.status(400).json({ message: 'MFA token is required' });
        return;
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: mfaToken,
        window: 2,
      });

      if (!verified) {
        res.status(400).json({ message: 'Invalid MFA token' });
        return;
      }
    }

    // Disable MFA
    await User.findByIdAndUpdate(req.user._id, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: []
    });

    res.json({
      message: 'MFA successfully disabled',
      mfaEnabled: false
    });

  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMFAStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    res.json({
      mfaEnabled: req.user.mfaEnabled || false,
      hasBackupCodes: req.user.mfaBackupCodes && req.user.mfaBackupCodes.length > 0
    });

  } catch (error) {
    console.error('Get MFA status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const generateNewBackupCodes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!req.user.mfaEnabled) {
      res.status(400).json({ message: 'MFA must be enabled to generate backup codes' });
      return;
    }

    const { mfaToken } = req.body;

    if (!mfaToken) {
      res.status(400).json({ message: 'MFA token is required' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.mfaSecret) {
      res.status(400).json({ message: 'MFA not properly configured' });
      return;
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken,
      window: 2,
    });

    if (!verified) {
      res.status(400).json({ message: 'Invalid MFA token' });
      return;
    }

    const backupCodes = generateBackupCodes();
    
    await User.findByIdAndUpdate(req.user._id, {
      mfaBackupCodes: backupCodes
    });

    res.json({
      message: 'New backup codes generated',
      backupCodes
    });

  } catch (error) {
    console.error('Generate backup codes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to generate backup codes
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}