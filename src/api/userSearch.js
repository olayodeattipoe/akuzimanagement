const express = require('express');
const router = express.Router();
const { db } = require('../database/connection');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * @route GET /users/search
 * @desc Search users by name or phone number
 * @access Private/Admin
 */
router.get('/search', verifyToken, isAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    
    // Validation
    if (!query || query.length < 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 3 characters long'
      });
    }

    const users = await searchUsers(query);
    
    return res.status(200).json({ 
      users: users 
    });
    
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while searching for users'
    });
  }
});

/**
 * Search users by name or phone number
 * @param {string} searchQuery - The search term to look for
 * @returns {Array} Array of matching users
 */
async function searchUsers(searchQuery) {
  try {
    // Sanitize the input to prevent SQL injection
    const searchTerm = `%${searchQuery.toLowerCase().trim()}%`;
    
    // Query the database for users matching the search term
    // Searching in both name and phone fields, case-insensitive
    const users = await db.query(
      `SELECT 
        user_id as id, 
        name, 
        email, 
        phone_number as phone 
      FROM users 
      WHERE 
        LOWER(name) LIKE ? OR 
        phone_number LIKE ?
      LIMIT 10`,
      [searchTerm, searchTerm]
    );

    return users || [];
  } catch (error) {
    console.error('Database error when searching users:', error);
    throw error;
  }
}

// Export the router and the search function for use in the centralized endpoint
module.exports = {
  router,
  searchUsers
}; 