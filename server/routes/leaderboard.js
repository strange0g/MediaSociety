const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get top leaderboard scores (optionally filtered by map_id)
router.get('/', (req, res) => {
  const { map_id, limit = 50 } = req.query;

  try {
    let query = `
      SELECT id, username, map_id, wave_reached, score, completion_time, created_at
      FROM leaderboard
    `;
    const params = [];

    if (map_id) {
      query += ` WHERE map_id = ?`;
      params.push(map_id);
    }

    query += ` ORDER BY score DESC, wave_reached DESC, completion_time ASC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const leaderboard = db.prepare(query).all(...params);
    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Submit a new high score (Authenticated)
router.post('/', authenticateToken, (req, res) => {
  const { map_id, wave_reached, score, completion_time } = req.body;
  const userId = req.user.id;
  const username = req.user.username;

  if (!map_id || wave_reached === undefined || score === undefined || completion_time === undefined) {
    return res.status(400).json({ error: 'Missing required game result fields' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO leaderboard (user_id, username, map_id, wave_reached, score, completion_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(userId, username, map_id, wave_reached, score, completion_time);

    res.status(201).json({
      message: 'Score submitted successfully',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Score submission error:', err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

module.exports = router;
