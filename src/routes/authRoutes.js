const express = require('express');
const {
  registerTenant,
  registerLandlord,
  login,
  logout,
  forgotPassword,
  sendOTP,
  verifyOTPController,
  registerValidation,
  loginValidation
} = require('../controllers/authController');
const validateRequest = require('../middleware/validation');

const router = express.Router();

// Tenant Auth Routes
router.post('/tenant/register', registerValidation, validateRequest, registerTenant);
router.post('/tenant/login', loginValidation, validateRequest, login);
router.post('/tenant/logout', logout);
router.patch('/tenant/forgot-password', forgotPassword);

// Landlord Auth Routes
router.post('/landlord/register', registerValidation, validateRequest, registerLandlord);
router.post('/landlord/login', loginValidation, validateRequest, login);
router.post('/landlord/logout', logout);
router.patch('/landlord/forgot-password', forgotPassword);

// Email Verification Routes
router.post('/email/send-otp', sendOTP);
router.post('/email/verify-otp', verifyOTPController);

module.exports = router;