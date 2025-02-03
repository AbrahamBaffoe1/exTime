const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/user');
const TimeEntry = require('../models/timeEntry');
const sequelize = require('../config/database');

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { username },
          { email }
        ] 
      } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      details: error.message 
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await user.validatePassword(password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Find the user's most recent time entry
    const lastEntry = await TimeEntry.findOne({
      where: { userId: user.id },
      order: [['timestamp', 'DESC']]
    });

    // Log login event
    await sequelize.query(
      `INSERT INTO auth_logs (user_id, type, ip_address, user_agent) VALUES (:userId, 'LOGIN', :ip, :userAgent)`,
      {
        replacements: {
          userId: user.id,
          ip: req.ip,
          userAgent: req.get('user-agent') || null
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastEntry: lastEntry
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error.message 
    });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { 
        exclude: ['password'] 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
});

// Authentication Middleware (add this at the bottom of the file)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log logout event
    await sequelize.query(
      `INSERT INTO auth_logs (user_id, type, ip_address, user_agent) VALUES (:userId, 'LOGOUT', :ip, :userAgent)`,
      {
        replacements: {
          userId: req.user.id,
          ip: req.ip,
          userAgent: req.get('user-agent') || null
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
