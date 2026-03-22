const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, d.name as department_name,
      CAST((SELECT AVG(marks) FROM marks m WHERE m.student_id = s.id) AS UNSIGNED) as avg_marks,
      (SELECT COUNT(*) FROM attendance a WHERE a.student_id = s.id AND a.status='present') as attendance
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
