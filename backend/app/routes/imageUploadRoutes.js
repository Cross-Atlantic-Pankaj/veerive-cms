import express from 'express';
import { uploadImage, deleteImage, handleImageUploadError } from '../controllers/imageUploadController.js';
import { uploadSingleImage } from '../../utils/s3Upload.js';
import { authenticateUser } from '../middlewares/authenticateUser.js';

const router = express.Router();

// Upload single image route
router.post('/upload', 
  authenticateUser, 
  uploadSingleImage('image'), 
  uploadImage, 
  handleImageUploadError
);

// Delete image route
router.delete('/delete', 
  authenticateUser, 
  deleteImage
);

export default router;
