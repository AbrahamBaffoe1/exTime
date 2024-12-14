const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateToken = async (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is present
  if (token == null) return res.sendStatus(401);

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    // If no user found
    if (!user) return res.sendStatus(403);

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    // Handle token verification errors
    if (error.name === 'JsonWebTokenError') {
      return res.sendStatus(403);
    }
    
    console.error('Authentication error:', error);
    res.sendStatus(500);
  }
};

module.exports = authenticateToken;