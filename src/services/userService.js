import axios from 'axios';
import { API_CONFIG } from '../config/constants';

/**
 * Search for users by name or phone number
 * @param {string} query - The search term (name or phone)
 * @returns {Promise<Array>} - Array of matching users
 */
export const searchUsers = async (query) => {
  try {
    // Validate the query
    if (!query || query.length < 3) {
      throw new Error('Search query must be at least 3 characters long');
    }
    
    // Option 1: Using REST API endpoint
    // const response = await axios.get(`${API_CONFIG.BASE_URL}/users/search`, {
    //   params: { query }
    // });
    
    // Option 2: Using the central endpoint (this is the format used in the current app)
    const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
      action: 'search_users',
      content: {
        query
      }
    });
    
    // Check for successful response
    if (response.data.status === 'success') {
      return response.data.users || [];
    } else {
      throw new Error(response.data.message || 'Failed to search users');
    }
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Get user details by ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - User details
 */
export const getUserById = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const response = await axios.post(`${API_CONFIG.BASE_URL}/mcc_primaryLogic/editables/`, {
      action: 'get_user_details',
      content: {
        user_id: userId
      }
    });
    
    if (response.data.status === 'success') {
      return response.data.user;
    } else {
      throw new Error(response.data.message || 'Failed to get user details');
    }
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
}; 