import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js'
import verifyTokenRoute from './middleware/authMiddleware.js'
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:8080/',
    'http://localhost:3000',
    'https://kitchen-mate-front-end.vercel.app',
    'https://kitchen-mate-front-end.vercel.app/'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from KitchenMate API!',
    status: 'running',
    version: '1.0.0'
  });
});

// Routes
app.use('middleWare', verifyTokenRoute);
app.use('auth', authRoutes);
app.use('product', productRoutes);
app.use('order', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 