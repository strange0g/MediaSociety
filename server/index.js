const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const leaderboardRoutes = require('./routes/leaderboard');
const saveRoutes = require('./routes/save');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Serve public static assets
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/save', saveRoutes);

// Fallback route for SPA
app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Cyberpunk TD] Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
