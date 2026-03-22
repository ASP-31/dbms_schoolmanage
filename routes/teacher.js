const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, 
      (SELECT COUNT(*) FROM subject s WHERE s.teacher_id = t.id) as subjects
      FROM teacher t
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM teacher WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
