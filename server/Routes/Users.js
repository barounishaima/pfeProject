// routes/users.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Auth middleware to check manager role
const authenticateManager = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Missing authorization token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Manager access required',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

// Route: Get all non-manager users
router.get('/', authenticateManager, async (req, res) => {
  try {
    const users = await User.find(
      { role: { $ne: 'manager' } },
      '-password -__v'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

export {router as userRoutes};
