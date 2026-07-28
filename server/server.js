const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const retailerRoutes = require('./routes/retailers');
const staffRoutes = require('./routes/staff');
const vehicleRoutes = require('./routes/vehicles');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✔ Server running on port ${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`  → http://localhost:${PORT}/api/test`);
  console.log(`  → http://localhost:${PORT}/api/auth/login`);
  console.log(`  → http://localhost:${PORT}/api/users`);
  console.log(`  → http://localhost:${PORT}/api/retailers`);
  console.log(`  → http://localhost:${PORT}/api/staff`);
  console.log(`  → http://localhost:${PORT}/api/vehicles`);
});