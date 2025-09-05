const User = require('../models/User');
const TenantProfile = require('../models/TenantProfile');
const LandlordProfile = require('../models/LandlordProfile');
const { generateToken } = require('../utils/jwtUtils');
const { sendOTPEmail, verifyOTP } = require('../utils/emailService');
const { body } = require('express-validator');

// Validation rules
const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('emailId').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phonenumber').notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('userName').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register Tenant
const registerTenant = async (req, res) => {
  try {
    const { fullName, emailId, password, phonenumber } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      fullName,
      emailId,
      password,
      phonenumber,
      userType: 'tenant'
    });

    await user.save();

    // Create tenant profile
    await TenantProfile.create({ userId: user._id });

    // Send verification email
    await sendOTPEmail(emailId, 'verification');

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully. Please verify your email.',
      user: {
        id: user._id,
        fullName: user.fullName,
        emailId: user.emailId,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Register Landlord
const registerLandlord = async (req, res) => {
  try {
    const { fullName, emailId, password, phonenumber } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = new User({
      fullName,
      emailId,
      password,
      phonenumber,
      userType: 'landlord'
    });

    await user.save();

    // Create landlord profile
    await LandlordProfile.create({ userId: user._id });

    // Send verification email
    await sendOTPEmail(emailId, 'verification');

    res.status(201).json({
      success: true,
      message: 'Landlord registered successfully. Please verify your email.',
      user: {
        id: user._id,
        fullName: user.fullName,
        emailId: user.emailId,
        userType: user.userType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ emailId: userName });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    const token = generateToken(user._id);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        emailId: user.emailId,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { emailId, newPassword } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send OTP for password reset
    await sendOTPEmail(emailId, 'password-reset');

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    await sendOTPEmail(email, 'verification');

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify OTP
const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyOTP(email, otp, 'verification');

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    // Update user email verification status
    await User.findOneAndUpdate(
      { emailId: email },
      { isEmailVerified: true }
    );

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerTenant,
  registerLandlord,
  login,
  logout,
  forgotPassword,
  sendOTP,
  verifyOTPController,
  registerValidation,
  loginValidation
};