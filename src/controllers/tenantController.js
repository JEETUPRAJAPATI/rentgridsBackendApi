const User = require('../models/User');
const TenantProfile = require('../models/TenantProfile');
const Application = require('../models/Application');
const SavedProperty = require('../models/SavedProperty');
const Property = require('../models/Property');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Get Profile
const getProfile = async (req, res) => {
  try {
    const profile = await TenantProfile.findOne({ userId: req.user._id })
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
    const { fullName, address, dob } = req.body;

    let profile = await TenantProfile.findOne({ userId: req.user._id });
    if (profile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists'
      });
    }

    // Update user details if provided
    if (fullName) {
      await User.findByIdAndUpdate(req.user._id, { fullName });
    }

    profile = await TenantProfile.create({
      userId: req.user._id,
      address,
      dob
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
    const { fullName, address, dob } = req.body;

    // Update user details if provided
    if (fullName) {
      await User.findByIdAndUpdate(req.user._id, { fullName });
    }

    const profile = await TenantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { address, dob, updatedAt: new Date() },
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

// Update Personal Details
const updatePersonalDetails = async (req, res) => {
  try {
    const { personalDetails } = req.body;

    const profile = await TenantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { personalDetails, updatedAt: new Date() },
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
      message: 'Personal details updated successfully',
      data: profile.personalDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Property Preferences
const updatePropertyPreferences = async (req, res) => {
  try {
    const { propertyPreferences } = req.body;

    const profile = await TenantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { propertyPreferences, updatedAt: new Date() },
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
      message: 'Property preferences updated successfully',
      data: profile.propertyPreferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Lifestyle Preferences
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    const profile = await TenantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { preferences, updatedAt: new Date() },
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
      message: 'Lifestyle preferences updated successfully',
      data: profile.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Rental History
const updateRentalHistory = async (req, res) => {
  try {
    const { rentalHistory } = req.body;

    const profile = await TenantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { rentalHistory, updatedAt: new Date() },
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
      message: 'Rental history updated successfully',
      data: profile.rentalHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload Document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document uploaded'
      });
    }

    const { docName } = req.body;

    const result = await uploadToCloudinary(
      req.file.buffer,
      'tenant_documents',
      'raw'
    );

    const profile = await TenantProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    profile.documents.push({
      docName,
      docUrl: result.secure_url
    });

    await profile.save();

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        docName,
        docUrl: result.secure_url
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload Video Intro
const uploadVideoIntro = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video uploaded'
      });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'video_intros',
      'video'
    );

    await TenantProfile.findOneAndUpdate(
      { userId: req.user._id },
      { videoIntroUrl: result.secure_url, updatedAt: new Date() }
    );

    res.json({
      success: true,
      message: 'Video intro uploaded successfully',
      videoUrl: result.secure_url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Dashboard Summary
const getDashboardSummary = async (req, res) => {
  try {
    const applications = await Application.find({ tenant: req.user._id });
    const savedProperties = await SavedProperty.find({ tenant: req.user._id });

    const summary = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      savedPropertiesCount: savedProperties.length,
      recentActivity: applications.slice(-5).reverse()
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Applications
const getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { tenant: req.user._id };
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('property', 'title images monthlyRent location')
      .populate('landlord', 'fullName emailId phonenumber')
      .sort({ appliedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
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

// Create Application
const createApplication = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({
      tenant: req.user._id,
      property: propertyId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Application already submitted for this property'
      });
    }

    const application = await Application.create({
      tenant: req.user._id,
      property: propertyId,
      landlord: property.owner
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Application Status
const getApplicationStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const application = await Application.findOne({
      tenant: req.user._id,
      property: propertyId
    }).populate('property', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reapply Application
const reapplyApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    application.status = 'pending';
    application.appliedAt = new Date();
    await application.save();

    res.json({
      success: true,
      message: 'Application resubmitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Saved Properties
const getSavedProperties = async (req, res) => {
  try {
    const savedProperties = await SavedProperty.find({ tenant: req.user._id })
      .populate('property')
      .sort({ savedAt: -1 });

    res.json({
      success: true,
      data: savedProperties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Save Property
const saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already saved
    const existingSaved = await SavedProperty.findOne({
      tenant: req.user._id,
      property: propertyId
    });

    if (existingSaved) {
      return res.status(400).json({
        success: false,
        message: 'Property already saved'
      });
    }

    const savedProperty = await SavedProperty.create({
      tenant: req.user._id,
      property: propertyId
    });

    res.status(201).json({
      success: true,
      message: 'Property saved successfully',
      data: savedProperty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Unsave Property
const unsaveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await SavedProperty.findOneAndDelete({
      tenant: req.user._id,
      property: propertyId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Saved property not found'
      });
    }

    res.json({
      success: true,
      message: 'Property unsaved successfully'
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
};