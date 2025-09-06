import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = `images/${file.fieldname}-${uniqueSuffix}${fileExtension}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
    }
  }
});

// Middleware for single image upload
export const uploadSingleImage = (fieldName) => {
  return upload.single(fieldName);
};

// Middleware for multiple image uploads
export const uploadMultipleImages = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Function to delete image from S3
export const deleteImageFromS3 = async (imageUrl) => {
  try {
    // Extract key from URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return { success: true, message: 'Image deleted successfully' };
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return { success: false, message: 'Error deleting image', error: error.message };
  }
};

// Function to get image URL from S3 upload result
export const getImageUrl = (uploadResult) => {
  if (uploadResult && uploadResult.location) {
    return uploadResult.location;
  }
  return null;
};

export default upload;
