const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { searchUsers } = require('./userSearch');

/**
 * @route POST /mcc_primaryLogic/editables
 * @desc Central endpoint for various operations including user search
 * @access Private/Admin
 */
router.post('/editables', verifyToken, isAdmin, async (req, res) => {
  try {
    const { action, content } = req.body;

    // Handle different actions
    switch (action) {
      case 'search_users':
        await handleUserSearch(content, res);
        break;

      // Other actions can be added here...
      
      default:
        return res.status(400).json({
          status: 'error',
          message: `Unknown action: ${action}`
        });
    }
  } catch (error) {
    console.error(`Error processing ${req.body.action} action:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred'
    });
  }
});

/**
 * Handler for user search action
 * @param {Object} content - The content object from the request body
 * @param {Object} res - Express response object
 */
async function handleUserSearch(content, res) {
  try {
    // Validate required fields
    if (!content.query || content.query.length < 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 3 characters long'
      });
    }

    // Call the search function from userSearch.js
    const users = await searchUsers(content.query);

    return res.json({
      status: 'success',
      users: users
    });
  } catch (error) {
    console.error('Error handling user search:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while searching for users'
    });
  }
}

module.exports = router; 