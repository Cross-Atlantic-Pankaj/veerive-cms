import { uploadSingleImage, getImageUrl, deleteImageFromS3 } from '../../utils/s3Upload.js';
import multer from 'multer';

// Upload single image
export const uploadImage = async (req, res) => {
  try {
    console.log('🚀 Image upload controller started');
    console.log('🚀 Request details:', {
      method: req.method,
      url: req.url,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        location: req.file.location,
        key: req.file.key,
        bucket: req.file.bucket
      } : null,
      bodyKeys: Object.keys(req.body || {}),
      user: req.user ? { id: req.user.id, email: req.user.email } : 'No user'
    });

    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check if AWS S3 is configured
    console.log('🔧 Checking AWS S3 configuration...');
    const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_here' &&
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key_here';
    
    console.log('🔧 AWS S3 configured:', awsConfigured);
    
    if (!awsConfigured) {
      console.log('❌ AWS S3 not configured properly');
      return res.status(503).json({
        success: false,
        message: 'Image upload service not configured. Please configure AWS S3 credentials.',
        data: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        }
      });
    }

    console.log('🔧 Getting image URL from upload result...');
    console.log('🔧 Upload result location type:', typeof req.file.location);
    console.log('🔧 Upload result location value:', req.file.location);
    const imageUrl = getImageUrl(req.file);
    console.log('🔧 Image URL result:', imageUrl);
    
    if (!imageUrl) {
      console.log('❌ Failed to get image URL from upload result');
      console.log('❌ File object details:', {
        location: req.file.location,
        key: req.file.key,
        bucket: req.file.bucket,
        etag: req.file.etag
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to get image URL from upload',
        debug: {
          hasLocation: !!req.file.location,
          hasKey: !!req.file.key,
          hasBucket: !!req.file.bucket
        }
      });
    }

    console.log('✅ Image upload successful, returning response');
    console.log('✅ Returning imageUrl:', imageUrl);
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: imageUrl, // This is the S3 URL that should be stored
        location: req.file.location, // Include original location for debugging
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        s3Key: req.file.key,
        s3Bucket: req.file.bucket
      }
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request details:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        location: req.file.location,
        key: req.file.key,
        bucket: req.file.bucket
      } : null,
      body: req.body,
      headers: req.headers
    });
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Delete image
export const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const result = await deleteImageFromS3(imageUrl);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// Middleware for handling image upload errors
export const handleImageUploadError = (error, req, res, next) => {
  console.error('❌ Multer error handler triggered:', error);
  console.error('❌ Error type:', error.constructor.name);
  console.error('❌ Error message:', error.message);
  console.error('❌ Error code:', error.code);
  
  if (error instanceof multer.MulterError) {
    console.error('❌ Multer error detected:', error.code);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error processing image upload',
    error: error.message
  });
};
