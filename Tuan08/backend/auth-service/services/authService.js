const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { publishEvent } = require('../config/rabbitmq');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-here', {
    expiresIn: process.env.JWT_EXPIRY || '24h'
  });
};

// Register user
const register = async (username, email, password) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      throw new Error('User with this email or username already exists');
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Publish USER_REGISTERED event to RabbitMQ
    await publishEvent('user.registered', {
      userId: user._id,
      username: user.username,
      email: user.email,
      timestamp: new Date()
    });

    const token = generateToken(user._id);
    return {
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    throw error;
  }
};

// Login user
const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);
    return {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  generateToken
};
