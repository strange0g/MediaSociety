const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long' });
  }

  try {
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);

    const token = jwt.sign({ id: result.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.lastInsertRowid, username }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token / Current User profile
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, user: decoded });
  });
});

module.exports = router;
