const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Lazy-load speakeasy and qrcode so the server starts even if they are not yet installed
const getSpeakeasy = () => require('speakeasy');
const getQRCode = () => require('qrcode');

// @route   POST /api/auth/2fa/setup
// @desc    Generate a TOTP secret and return a QR code for the authenticator app
// @access  Private
router.post('/setup', auth, async (req, res) => {
  try {
    const speakeasy = getSpeakeasy();
    const qrcode = getQRCode();

    const user = req.user;

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled on this account.' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `EduManage (${user.email})`,
      length: 20,
    });

    // Temporarily store secret (not yet enabled)
    await User.findByIdAndUpdate(user._id, { twoFactorSecret: secret.base32 });

    // Generate QR code data URL
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    if (error.code === 'MODULE_NOT_FOUND') {
      return res.status(503).json({ message: '2FA service not available. Required packages: speakeasy, qrcode.' });
    }
    res.status(500).json({ message: 'Server error during 2FA setup' });
  }
});

// @route   POST /api/auth/2fa/enable
// @desc    Verify a TOTP token and activate 2FA for the account
// @access  Private
router.post('/enable', auth, async (req, res) => {
  try {
    const speakeasy = getSpeakeasy();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: 'Please run 2FA setup first.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    await User.findByIdAndUpdate(user._id, { twoFactorEnabled: true });

    res.json({ message: '2FA has been enabled successfully.' });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ message: 'Server error enabling 2FA' });
  }
});

// @route   POST /api/auth/2fa/verify
// @desc    Verify TOTP token during login
// @access  Public (called after password check passes)
router.post('/verify', async (req, res) => {
  try {
    const speakeasy = getSpeakeasy();
    const jwt = require('jsonwebtoken');
    const { tempToken, totpCode } = req.body;

    if (!tempToken || !totpCode) {
      return res.status(400).json({ message: 'Temp token and TOTP code are required' });
    }

    // Decode the temp token (short-lived, signed with JWT_SECRET)
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
    }

    if (decoded.type !== '2fa_pending') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ message: 'User not found or 2FA not configured' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: totpCode,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid authentication code. Please try again.' });
    }

    // Issue full session token
    const sessionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({ token: sessionToken, user: user.toJSON() });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ message: 'Server error during 2FA verification' });
  }
});

// @route   DELETE /api/auth/2fa/disable
// @desc    Disable 2FA for the account (requires current TOTP token)
// @access  Private
router.delete('/disable', auth, async (req, res) => {
  try {
    const speakeasy = getSpeakeasy();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Current TOTP token is required to disable 2FA' });
    }

    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not currently enabled.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid TOTP code. 2FA was not disabled.' });
    }

    await User.findByIdAndUpdate(user._id, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    res.json({ message: '2FA has been disabled.' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Server error disabling 2FA' });
  }
});

// @route   GET /api/auth/2fa/status
// @desc    Return whether 2FA is enabled for the current user
// @access  Private
router.get('/status', auth, (req, res) => {
  res.json({ twoFactorEnabled: !!req.user.twoFactorEnabled });
});

module.exports = router;
