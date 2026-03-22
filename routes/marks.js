const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, 
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        c.name as course_name
      FROM marks m
      LEFT JOIN students s ON m.student_id = s.id
      LEFT JOIN courses c ON m.course_id = c.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM marks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
