const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, c.class_name as class_name,
      CAST((SELECT AVG(score) FROM marks m WHERE m.student_id = s.id) AS UNSIGNED) as avg_score
      FROM student s
      LEFT JOIN class c ON s.class_id = c.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.put('/:id', async (req, res) => {
  const { name, age, class_id } = req.body;
  try {
    await db.query('UPDATE student SET name = ?, age = ?, class_id = ? WHERE id = ?', [name, age || null, class_id || null, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM student WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;