const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const retailerRoutes = require('./routes/retailers');
const staffRoutes = require('./routes/staff');
const vehicleRoutes = require('./routes/vehicles');
const pricingRoutes = require('./routes/pricing');
const orderRoutes = require('./routes/orders');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'https://yellow-butterfly-972674.hostingersite.com',
  'https://yellow-butterfly-972674.hostingsite.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

// Middleware - CORS handles OPTIONS requests automatically
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      // Allow all for testing (remove in production)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ REMOVED: app.options('*', cors()); - This line was causing the error

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', { ...req.body, password: req.body.password ? '********' : undefined });
  }
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: '✅ Backend is working!',
    server: `Running on port ${PORT}`,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/orders', orderRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✔ Server running on port ${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`  → http://localhost:${PORT}/api/test`);
  console.log(`  → http://localhost:${PORT}/api/auth/login`);
  console.log(`  → http://localhost:${PORT}/api/auth/me`);
  console.log(`  → http://localhost:${PORT}/api/users`);
  console.log(`  → http://localhost:${PORT}/api/retailers`);
  console.log(`  → http://localhost:${PORT}/api/retailers/me`);
  console.log(`  → http://localhost:${PORT}/api/retailers/stats`);
  console.log(`  → http://localhost:${PORT}/api/retailers/orders`);
  console.log(`  → http://localhost:${PORT}/api/staff`);
  console.log(`  → http://localhost:${PORT}/api/vehicles`);
  console.log(`  → http://localhost:${PORT}/api/pricing/current`);
});