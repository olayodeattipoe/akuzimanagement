const jwt = require('jsonwebtoken');
const { db } = require('../database/connection');

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  // Get token from header, query, or cookie
  const token = req.headers.authorization?.split(' ')[1] || req.query.token || req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token.'
    });
  }
};

/**
 * Middleware to check if user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    // Check if user has admin role
    const userRoles = await db.query(
      'SELECT role FROM user_roles WHERE user_id = ?',
      [req.user.id]
    );

    if (!userRoles || !userRoles.some(role => role.role === 'admin')) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin rights required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin
}; 