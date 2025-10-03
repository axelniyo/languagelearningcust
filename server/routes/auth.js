import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import pool from '../config/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Email configuration
let emailTransporter = null;

const createEmailTransporter = async () => {
  if (!emailTransporter) {
    emailTransporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return emailTransporter;
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;
  
  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Check if user exists
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (email, username, password_hash, xp, level, streak_count) VALUES (?, ?, ?, 0, 1, 0)',
      [email, username, hashedPassword]
    );

    const newUser = {
      id: result.insertId,
      email,
      username
    };

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Sign in route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Don't send password back
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Please provide an email' });
  }

  try {
    // Find user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If an account exists with this email, a reset link has been sent' });
    }
    
    const user = users[0];
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Save token to database
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );
    
    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    try {
      const transporter = await createEmailTransporter();
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      
      res.json({ message: 'Password reset email sent' });
      
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error('Error sending password reset email');
    }
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }
  
  try {
    // Find user with valid token
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    const user = users[0];
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    res.json({ message: 'Password updated successfully' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Sign out route
router.post('/signout', (req, res) => {
  // For JWT, we can't invalidate tokens on the server side easily
  // The client will remove the token from localStorage
  res.json({ message: 'Signed out successfully' });
});

export default router;
