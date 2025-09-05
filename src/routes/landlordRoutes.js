const express = require('express');
const {
  getProfile,
  createProfile,
  updateProfile,
  uploadProfilePhoto,
  getVisitRequests,
  updateVisitRequest,
  createPreferredTenant,
  getPreferredTenants,
  updatePreferredTenant,
  deletePreferredTenant
} = require('../controllers/landlordController');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all landlord routes
router.use(auth);
router.use(requireRole(['landlord']));

// Profile Routes
router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);
router.post('/profile/photo', upload.single('photo'), uploadProfilePhoto);

// Visit Requests
router.get('/visit-requests', getVisitRequests);
router.patch('/visit-requests/:requestId', updateVisitRequest);

// Preferred Tenants
router.post('/preferred-tenants', createPreferredTenant);
router.get('/preferred-tenants', getPreferredTenants);
router.put('/preferred-tenants/:preferredTenantId', updatePreferredTenant);
router.delete('/preferred-tenants/:preferredTenantId', deletePreferredTenant);

module.exports = router;