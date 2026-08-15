const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper functions to generate JWT tokens (Standard _id payload)
const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' } // Extended for smooth demo testing
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '30d' }
  );
};

// 1. Register User or Admin
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'user',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens = [refreshToken];
    await user.save();

    res.status(201).json({
      message: 'Account registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Login User / Admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Refresh Access Token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    );

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// 4. Logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (req.user && refreshToken) {
      req.user.refreshTokens = req.user.refreshTokens.filter((token) => token !== refreshToken);
      await req.user.save();
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, refresh, logout };