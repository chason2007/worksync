// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const attendanceRoutes = require('./routes/attendance');
const authRoute = require('./routes/auth');
const path = require('path');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors()); // CORS should be configured more restrictively in production

// Rate Limiting - Global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, res, next) => {
  console.log(`[GLOBAL LOG] ${req.method} ${req.url}`);
  next();
});
console.log('Auth Route Loaded:', typeof authRoute);

app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', require('./routes/admin'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/notifications', require('./routes/notifications'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4 // Use IPv4, skip trying IPv6
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    // process.exit(1); // Don't exit, let it keep retrying or fail gracefully
  }
};

connectDB();

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB Cluster');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Routes

// Route Middlewares
app.use('/api/auth', authRoute);
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;


