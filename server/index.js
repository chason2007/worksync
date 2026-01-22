// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const attendanceRoutes = require('./routes/attendance');
const authRoute = require('./routes/auth');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/attendance', attendanceRoutes);

// Connect to MongoDB (Replace with your Atlas string later)
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employeeDB')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB Connection Failed:", err.message);
    // check for IP whitelist error specifically
    if (err.message.includes('bad auth')) console.error("Possible bad password or IP whitelist issue.");
  });

mongoose.connection.on('error', err => {
  console.error("Runtime MongoDB Error:", err);
});

// Routes

// Route Middlewares
app.use('/api/auth', authRoute); // This adds /register and /login

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


