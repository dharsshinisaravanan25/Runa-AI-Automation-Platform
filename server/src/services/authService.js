const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../models/dbAdapter');

class AuthService {
  async register(userData) {
    const { name, email, password, role = 'operator' } = userData;

    const existingUser = await db.User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const error = new Error('User already exists with this email address');
      error.statusCode = 400;
      throw error;
    }

    // Password hashing with bcrypt cost 12
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'operator',
      lastLogin: new Date()
    });

    const token = this.generateToken(newUser._id, newUser.role);

    return {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        lastLogin: newUser.lastLogin
      },
      token
    };
  }

  async login(email, password) {
    const user = await db.User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    await db.User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = this.generateToken(user._id, user.role);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: new Date()
      },
      token
    };
  }

  async getCurrentUser(userId) {
    const user = await db.User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
  }

  generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      const error = new Error('Invalid or expired authentication token');
      error.statusCode = 401;
      throw error;
    }
  }
}

module.exports = new AuthService();
