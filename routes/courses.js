const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, d.name as department_name,
        (SELECT COUNT(*) FROM attendance a WHERE a.course_id = c.id) as enrolled,
        CAST((SELECT AVG(m.marks) FROM marks m WHERE m.course_id = c.id) AS UNSIGNED) as avg_score
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
