const express = require('express');
const {
  getProfile,
  createProfile,
  updateProfile,
  uploadProfilePhoto,
  updatePersonalDetails,
  updatePropertyPreferences,
  updatePreferences,
  updateRentalHistory,
  uploadDocument,
  uploadVideoIntro,
  getDashboardSummary,
  getApplications,
  createApplication,
  getApplicationStatus,
  reapplyApplication,
  getSavedProperties,
  saveProperty,
  unsaveProperty
} = require('../controllers/tenantController');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all tenant routes
router.use(auth);
router.use(requireRole(['tenant']));

// Profile Routes
router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);
router.post('/profile/photo', upload.single('photo'), uploadProfilePhoto);

// Profile Sections
router.patch('/personal-details', updatePersonalDetails);
router.put('/property-preferences', updatePropertyPreferences);
router.put('/preferences', updatePreferences);
router.put('/rental-history', updateRentalHistory);

// Documents & Media
router.post('/documents', upload.single('file'), uploadDocument);
router.post('/video-intro', upload.single('video'), uploadVideoIntro);

// Dashboard & Applications
router.get('/dashboard/summary', getDashboardSummary);
router.get('/applications', getApplications);
router.post('/applications', createApplication);
router.get('/applications/:propertyId/status', getApplicationStatus);
router.post('/applications/:applicationId/reapply', reapplyApplication);

// Saved Properties
router.get('/saved-properties', getSavedProperties);
router.post('/saved-properties', saveProperty);
router.delete('/saved-properties/:propertyId', unsaveProperty);

module.exports = router;