const mysql = require('mysql2/promise');
const { promisify } = require('util');

// Load environment variables - in a real app use dotenv or similar
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'food_ordering_app';

// Create a connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Execute a database query with prepared statements
 * @param {string} sql - SQL query string with placeholders
 * @param {Array} params - Parameters to substitute in the SQL query
 * @returns {Promise<Array>} Promise resolving to query results
 */
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Export the database methods
module.exports = {
  db: {
    query
  },
  pool
}; 