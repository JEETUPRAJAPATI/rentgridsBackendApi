const cloudinary = require('cloudinary').v2;
const { saveToLocalStorage } = require('./localStorage');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'image') => {
  // Check if Cloudinary is properly configured
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || !api_key || !api_secret ||
    cloud_name === 'your_cloudinary_cloud_name' ||
    api_key === 'your_cloudinary_api_key') {
    console.log('Cloudinary not configured, using local storage...');
    return await saveToLocalStorage(fileBuffer, folder, `file_${Date.now()}.${resourceType === 'image' ? 'jpg' : 'pdf'}`);
  }

  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType
        },
        (error, result) => {
          if (error) {
            console.log('Cloudinary upload failed, falling back to local storage...');
            // Fallback to local storage if Cloudinary fails
            saveToLocalStorage(fileBuffer, folder, `file_${Date.now()}.${resourceType === 'image' ? 'jpg' : 'pdf'}`)
              .then(resolve)
              .catch(reject);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.log('Cloudinary error, using local storage fallback...');
    return await saveToLocalStorage(fileBuffer, folder, `file_${Date.now()}.${resourceType === 'image' ? 'jpg' : 'pdf'}`);
  }
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.log('Cloudinary delete failed:', error.message);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};