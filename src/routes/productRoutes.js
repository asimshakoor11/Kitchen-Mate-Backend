import express from 'express';
import { upload } from '../config/cloudinary.configuration.js';
import { createProduct, getProducts, getProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

// Create product (admin only)
router.post(
  '/add',
  upload.array('images', 5), // Allow up to 5 images
  createProduct
);

// Update product (admin only)
router.put(
  '/update/:id',
  upload.array('images', 5),
  updateProduct
);

// Get all products (public)
router.get('/all', getProducts);

// Get single product (public)
router.get('/:id', getProduct);

// Delete product (admin only)
router.delete('/:id', deleteProduct);

export default router; 