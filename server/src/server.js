//server/src/server.js
require('dotenv').config();
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  server.close(() => process.exit(1));
});
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const config = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
console.log('👉 Real auth routes file loaded from:', require.resolve('./routes/auth'));
const fileRoutes = require('./routes/files');
const uploadRoutes = require('./routes/upload');
const widgetRoutes = require('./routes/widgets');
const kpiRoutes = require('./routes/kpi');
const waterRoutes = require('./routes/water');
const wasteRoutes = require('./routes/waste');
const energyRoutes = require('./routes/energyRoutes');
const adminRoutes = require('./routes/admin');
const emissionsRoutes = require('./routes/emissionsRoutes');
const app = express();
connectDB();
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ESG Dashboard API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emissions', emissionsRoutes);
//app.use('/api/admin', require('./routes/admin')); 

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ESG Dashboard API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      files: '/api/files',
      widgets: '/api/widgets',
      kpi: '/api/kpi',
      water: '/api/water',
      waste: '/api/waste'
    },
    documentation: 'See README.md for API documentation'
  });
});
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🌍 CORS enabled for: ${config.CLIENT_URL}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;