const express = require('express');
const { body } = require('express-validator');
const pool = require('../config/database');
const { generateToken, comparePassword } = require('../config/auth');
const { handleValidationErrors } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint
router.post('/login', 
  loginLimiter,
  [
    body('username').trim().isLength({ min: 1 }).withMessage('Username is required'),
    body('password').isLength({ min: 1 }).withMessage('Password is required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user by username
      const userResult = await pool.query(
        'SELECT id, username, password_hash, full_name, role, status FROM users WHERE username = $1',
        [username]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (user.status !== 'Active') {
        return res.status(401).json({ error: 'Account is inactive' });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user.id, user.role);

      // Return user data (without password hash)
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          status: user.status
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { verifyToken } = require('../config/auth');
    const decoded = verifyToken(token);

    // Get fresh user data
    const userResult = await pool.query(
      'SELECT id, username, full_name, role, status FROM users WHERE id = $1 AND status = $2',
      [decoded.userId, 'Active']
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const user = userResult.rows[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;