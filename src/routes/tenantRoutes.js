const express = require('express');
const {
  getProfile,
  createProfile,
  updateProfile,
  uploadAvatar,
  uploadProfilePhoto,
  uploadDocument,
  getDocuments,
  deleteDocument,
  verifyKYC,
  getDashboardSummary,
  getSavedProperties,
  saveProperty,
  deleteSavedProperty,
  bulkDeleteSavedProperties,
  replaceSavedProperties
} = require('../controllers/tenantController');
const { auth, requireUserType } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all tenant routes
router.use(auth);
router.use(requireUserType(['tenant']));

// Profile Routes
router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);
router.post('/profile/avatar', uploadAvatar);
router.post('/profile/photo', upload.single('photo'), uploadProfilePhoto);

// Documents
router.post('/documents', upload.single('file'), uploadDocument);
router.get('/documents', getDocuments);
router.delete('/documents/:id', deleteDocument);
router.patch('/verify', verifyKYC);

// Dashboard
router.get('/dashboard/summary', getDashboardSummary);

// Saved Properties
router.get('/saved-properties', getSavedProperties);
router.post('/saved-properties', saveProperty);
router.delete('/saved-properties/:id', deleteSavedProperty);
router.post('/saved-properties/bulk-delete', bulkDeleteSavedProperties);
router.post('/saved-properties/replace', replaceSavedProperties);

module.exports = router;