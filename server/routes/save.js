const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get saved game state for logged-in user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  try {
    const saveRow = db.prepare('SELECT map_id, save_data, updated_at FROM game_saves WHERE user_id = ?').get(userId);

    if (!saveRow) {
      return res.status(404).json({ message: 'No saved game found' });
    }

    res.json({
      map_id: saveRow.map_id,
      save_data: JSON.parse(saveRow.save_data),
      updated_at: saveRow.updated_at
    });
  } catch (err) {
    console.error('Fetch game save error:', err);
    res.status(500).json({ error: 'Failed to retrieve saved game' });
  }
});

// Save or update game state for logged-in user
router.post('/', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { map_id, save_data } = req.body;

  if (!map_id || !save_data) {
    return res.status(400).json({ error: 'map_id and save_data are required' });
  }

  try {
    const serializedData = typeof save_data === 'string' ? save_data : JSON.stringify(save_data);

    const stmt = db.prepare(`
      INSERT INTO game_saves (user_id, map_id, save_data, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        map_id = excluded.map_id,
        save_data = excluded.save_data,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(userId, map_id, serializedData);

    res.json({ message: 'Game saved successfully' });
  } catch (err) {
    console.error('Save game error:', err);
    res.status(500).json({ error: 'Failed to save game state' });
  }
});

// Delete saved game state after game over or completion
router.delete('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  try {
    db.prepare('DELETE FROM game_saves WHERE user_id = ?').run(userId);
    res.json({ message: 'Saved game deleted' });
  } catch (err) {
    console.error('Delete save error:', err);
    res.status(500).json({ error: 'Failed to delete saved game' });
  }
});

module.exports = router;
