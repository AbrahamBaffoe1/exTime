require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import models to ensure they're registered
const User = require('./models/user');
const TimeEntry = require('./models/timeEntry');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/time-entries', require('./routes/timeEntries'));

// Database connection and sync
sequelize.sync() // Sync without dropping tables
  .then(() => {
    console.log('Database connected and synchronized');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
});

module.exports = app;
