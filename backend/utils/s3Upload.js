import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS S3 (only if credentials are provided)
let s3Client = null;
console.log('🔧 AWS Configuration Check:', {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set',
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME
});

if (process.env.AWS_ACCESS_KEY_ID && 
    process.env.AWS_ACCESS_KEY_ID !== 'your_aws_access_key_here' &&
    process.env.AWS_SECRET_ACCESS_KEY && 
    process.env.AWS_SECRET_ACCESS_KEY !== 'your_aws_secret_key_here') {
  try {
    // Configure AWS S3 Client v3
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    console.log('✅ AWS S3 Client v3 configured successfully');
    console.log('✅ S3 Region:', process.env.AWS_REGION);
    console.log('✅ S3 Bucket:', process.env.AWS_S3_BUCKET_NAME);
    
    // Test S3 connection
    const headBucketCommand = new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME });
    s3Client.send(headBucketCommand)
      .then(() => {
        console.log('✅ S3 Bucket access test successful');
      })
      .catch((err) => {
        console.error('❌ S3 Bucket access test failed:', err.message);
      });
    
  } catch (error) {
    console.error('❌ Error configuring AWS S3:', error);
  }
} else {
  console.warn('⚠️ AWS credentials not configured. Image upload functionality will be disabled.');
}

// Configure multer for S3 upload (only if S3 is available)
let upload;
if (s3Client) {
  console.log('🔧 Configuring multer with S3 storage...');
  upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      key: function (req, file, cb) {
        console.log('🔧 Generating S3 key for file:', file.originalname);
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = `images/${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        console.log('🔧 Generated S3 key:', fileName);
        cb(null, fileName);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        console.log('🔧 Setting S3 metadata for file:', file.originalname);
        cb(null, { 
          fieldName: file.fieldname,
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        });
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      console.log('🔧 File filter checking:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
      });
      
      // Check file type
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        console.log('✅ File type validation passed');
        return cb(null, true);
      } else {
        console.log('❌ File type validation failed');
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
      }
    }
  });
  console.log('✅ Multer S3 configuration completed');
} else {
  console.log('⚠️ Configuring multer with memory storage (S3 not available)');
  // Fallback to memory storage when S3 is not available
  upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      console.log('🔧 Memory storage file filter checking:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
      });
      
      // Check file type
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        console.log('✅ File type validation passed (memory storage)');
        return cb(null, true);
      } else {
        console.log('❌ File type validation failed (memory storage)');
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
      }
    }
  });
}

// Middleware for single image upload
export const uploadSingleImage = (fieldName) => {
  return (req, res, next) => {
    console.log('🔄 Multer middleware starting for field:', fieldName);
    console.log('🔄 Request method:', req.method);
    console.log('🔄 Request URL:', req.url);
    console.log('🔄 Request headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'authorization': req.headers['authorization'] ? 'Present' : 'Missing'
    });
    console.log('🔄 Request body keys:', Object.keys(req.body || {}));
    
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error details:', {
          message: err.message,
          code: err.code,
          field: err.field,
          storageErrors: err.storageErrors
        });
        console.error('❌ Multer error stack:', err.stack);
        return next(err);
      }
      
      console.log('✅ Multer processing completed successfully');
      console.log('✅ File info:', req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        location: req.file.location,
        key: req.file.key,
        bucket: req.file.bucket,
        etag: req.file.etag
      } : 'No file received');
      
      if (req.file && req.file.location) {
        console.log('✅ Image URL generated:', req.file.location);
      }
      
      next();
    });
  };
};

// Middleware for multiple image uploads
export const uploadMultipleImages = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Function to delete image from S3
export const deleteImageFromS3 = async (imageUrl) => {
  if (!s3Client) {
    return { success: false, message: 'AWS S3 not configured' };
  }
  
  try {
    // Extract key from URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    });

    await s3Client.send(deleteCommand);
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
