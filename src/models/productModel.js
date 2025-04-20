import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Fruits', 'Vegetables', 'Bakery', 'Dairy', 'Juice', 'Groceries']
  },
  price: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  quality: {
    type: String,
    required: true
  },
  storage: {
    type: String,
    required: true
  },
  packaging: {
    type: String,
    required: true
  },
  weight: {
    type: String,
    required: true
  },
  imageUrls: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema); 