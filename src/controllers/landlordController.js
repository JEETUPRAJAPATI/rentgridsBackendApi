const User = require('../models/User');
const LandlordProfile = require('../models/LandlordProfile');
const VisitRequest = require('../models/VisitRequest');
const PreferredTenant = require('../models/PreferredTenant');
const Property = require('../models/Property');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Get Profile
const getProfile = async (req, res) => {
  try {
    const profile = await LandlordProfile.findOne({ userId: req.user._id })
      .populate('userId', 'fullName emailId phonenumber profilePhoto');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create Profile
const createProfile = async (req, res) => {
  try {
    const { dob, propertyType } = req.body;

    let profile = await LandlordProfile.findOne({ userId: req.user._id });
    if (profile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists'
      });
    }

    profile = await LandlordProfile.create({
      userId: req.user._id,
      dob,
      propertyType
    });

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, dob, propertyType } = req.body;

    // Update user details if provided
    if (fullName) {
      await User.findByIdAndUpdate(req.user._id, { fullName });
    }

    const profile = await LandlordProfile.findOneAndUpdate(
      { userId: req.user._id },
      { dob, propertyType, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload Profile Photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'profile_photos',
      'image'
    );

    await User.findByIdAndUpdate(req.user._id, {
      profilePhoto: result.secure_url
    });

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      photoUrl: result.secure_url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Visit Requests
const getVisitRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { landlord: req.user._id };
    if (status) {
      query.status = status;
    }

    const visitRequests = await VisitRequest.find(query)
      .populate('tenant', 'fullName emailId phonenumber')
      .populate('property', 'title location images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await VisitRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        visitRequests,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: page * limit < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Visit Request
const updateVisitRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, date, note } = req.body;

    const visitRequest = await VisitRequest.findById(requestId);
    if (!visitRequest) {
      return res.status(404).json({
        success: false,
        message: 'Visit request not found'
      });
    }

    if (visitRequest.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    let updateData = { updatedAt: new Date() };

    switch (action) {
      case 'accept':
        updateData.status = 'accepted';
        break;
      case 'reject':
        updateData.status = 'rejected';
        break;
      case 'schedule':
        updateData.status = 'scheduled';
        updateData.scheduledDate = new Date(date);
        updateData.notes = note;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const updatedRequest = await VisitRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: `Visit request ${action}ed successfully`,
      data: updatedRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create Preferred Tenant
const createPreferredTenant = async (req, res) => {
  try {
    const { propertyId, tenantTypes, notes } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const preferredTenant = await PreferredTenant.create({
      landlord: req.user._id,
      property: propertyId,
      tenantTypes,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Preferred tenant created successfully',
      data: preferredTenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Preferred Tenants
const getPreferredTenants = async (req, res) => {
  try {
    const { propertyId } = req.query;
    
    const query = { landlord: req.user._id };
    if (propertyId) {
      query.property = propertyId;
    }

    const preferredTenants = await PreferredTenant.find(query)
      .populate('property', 'title location');

    res.json({
      success: true,
      data: preferredTenants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Preferred Tenant
const updatePreferredTenant = async (req, res) => {
  try {
    const { preferredTenantId } = req.params;
    const { tenantTypes, notes } = req.body;

    const preferredTenant = await PreferredTenant.findById(preferredTenantId);
    if (!preferredTenant) {
      return res.status(404).json({
        success: false,
        message: 'Preferred tenant not found'
      });
    }

    if (preferredTenant.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const updated = await PreferredTenant.findByIdAndUpdate(
      preferredTenantId,
      { tenantTypes, notes, updatedAt: new Date() },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Preferred tenant updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Preferred Tenant
const deletePreferredTenant = async (req, res) => {
  try {
    const { preferredTenantId } = req.params;

    const preferredTenant = await PreferredTenant.findById(preferredTenantId);
    if (!preferredTenant) {
      return res.status(404).json({
        success: false,
        message: 'Preferred tenant not found'
      });
    }

    if (preferredTenant.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await PreferredTenant.findByIdAndDelete(preferredTenantId);

    res.json({
      success: true,
      message: 'Preferred tenant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
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
};