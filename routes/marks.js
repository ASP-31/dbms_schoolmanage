const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, 
        s.name as student_name,
        sub.subject_name as subject_name
      FROM marks m
      LEFT JOIN student s ON m.student_id = s.id
      LEFT JOIN subject sub ON m.subject_id = sub.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Marks GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { student_id, subject_id, score } = req.body;
  console.log('PUT marks body:', req.body);
  try {
    await db.query(
      'UPDATE marks SET student_id = ?, subject_id = ?, score = ? WHERE id = ?',
      [student_id, subject_id, score, req.params.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error('Marks PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM marks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Marks DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;